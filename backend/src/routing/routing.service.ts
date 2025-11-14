import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutingRule } from './routing.entity';
import { CreateRoutingRuleDto } from './dto/create-routing-rule.dto';
import { UpdateRoutingRuleDto } from './dto/update-routing-rule.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class RoutingService {
  constructor(
    @InjectRepository(RoutingRule)
    private routingRepository: Repository<RoutingRule>,
  ) {}

  async findAll(): Promise<RoutingRule[]> {
    return this.routingRepository.find({
      order: { priority: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RoutingRule> {
    const rule = await this.routingRepository.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Routing rule with ID ${id} not found`);
    }
    return rule;
  }

  async create(createDto: CreateRoutingRuleDto): Promise<RoutingRule> {
    const rule = this.routingRepository.create(createDto);
    const saved = await this.routingRepository.save(rule);
    
    // Regenerate Asterisk dialplan
    await this.generateAsteriskDialplan();
    
    return saved;
  }

  async update(id: string, updateDto: UpdateRoutingRuleDto): Promise<RoutingRule> {
    const rule = await this.findOne(id);
    Object.assign(rule, updateDto);
    const updated = await this.routingRepository.save(rule);
    
    // Regenerate Asterisk dialplan
    await this.generateAsteriskDialplan();
    
    return updated;
  }

  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);
    await this.routingRepository.remove(rule);
    
    // Regenerate Asterisk dialplan
    await this.generateAsteriskDialplan();
  }

  async incrementCallCount(id: string): Promise<void> {
    await this.routingRepository.increment({ id }, 'callsRouted', 1);
  }

  async simulateRouting(
    callerNumber: string,
    ivrOption: string,
    callTime: string,
  ): Promise<any> {
    const rules = await this.findAll();
    const hour = parseInt(callTime.split(':')[0]);

    // Find matching rule based on priority
    let matchedRule = null;

    for (const rule of rules.filter((r) => r.enabled)) {
      let isMatch = false;

      for (const condition of rule.conditions) {
        // Check VIP caller
        if (condition.toLowerCase().includes('ministry') && callerNumber.toLowerCase().includes('ministry')) {
          isMatch = true;
          break;
        }

        // Check IVR option
        if (condition.includes(`IVR Option: ${ivrOption}`)) {
          isMatch = true;
          break;
        }

        // Check time-based
        if (condition.includes('Time:')) {
          if (condition.includes('6PM-8AM') && (hour < 8 || hour >= 18)) {
            isMatch = true;
            break;
          }
          if (condition.includes('8AM-6PM') && hour >= 8 && hour < 18) {
            isMatch = true;
            break;
          }
        }
      }

      if (isMatch) {
        matchedRule = rule;
        break;
      }
    }

    // Default to first queue if no match
    if (!matchedRule) {
      matchedRule = rules.find((r) => r.destinationType === 'queue');
    }

    return {
      caller: callerNumber,
      ivr: ivrOption,
      time: callTime,
      matchedRule: matchedRule?.name || 'No match',
      destination: matchedRule?.destination || 'General Queue',
      destinationType: matchedRule?.destinationType || 'queue',
      route: [
        'Call Received',
        'IVR Menu Played',
        `Option ${ivrOption} Selected`,
        `Matched Rule: ${matchedRule?.name || 'Default'}`,
        `Routed to: ${matchedRule?.destination || 'General Queue'}`,
      ],
    };
  }

  async generateAsteriskDialplan(): Promise<void> {
    const rules = await this.findAll();
    
    let dialplan = `;
; Auto-generated Asterisk Dialplan for Ministry of Education Call Center
; Generated at: ${new Date().toISOString()}
; DO NOT EDIT MANUALLY - Managed by Call Center Dashboard
;

[from-external]
exten => _X.,1,NoOp(Incoming call from \${CALLERID(num)})
same => n,Answer()
same => n,Set(CHANNEL(language)=en)
same => n,Playback(welcome)
same => n,Goto(main-ivr,s,1)

[main-ivr]
exten => s,1,NoOp(Main IVR Menu)
same => n,Background(ministry-menu)
same => n,WaitExten(10)
same => n,Goto(s,1)

`;

    // Generate extensions for each rule
    rules
      .filter((r) => r.enabled)
      .sort((a, b) => a.priority - b.priority)
      .forEach((rule) => {
        const ivrOption = this.extractIVROption(rule.conditions);
        
        if (ivrOption) {
          dialplan += `exten => ${ivrOption},1,NoOp(Route: ${rule.name})\n`;
          
          switch (rule.destinationType) {
            case 'queue':
              dialplan += `same => n,Queue(${rule.destination.toLowerCase().replace(/\s+/g, '_')},t)\n`;
              break;
            case 'agent':
              dialplan += `same => n,Dial(SIP/${rule.destination.toLowerCase().replace(/\s+/g, '_')},30,t)\n`;
              break;
            case 'voicemail':
              dialplan += `same => n,VoiceMail(100@default)\n`;
              break;
            case 'ivr':
              dialplan += `same => n,Goto(${rule.destination},s,1)\n`;
              break;
            default:
              dialplan += `same => n,Queue(general,t)\n`;
          }
          
          dialplan += `same => n,Hangup()\n\n`;
        }
      });

    // Add timeout and invalid handlers
    dialplan += `exten => t,1,NoOp(Timeout)
same => n,Playback(vm-goodbye)
same => n,Hangup()

exten => i,1,NoOp(Invalid option)
same => n,Playback(invalid)
same => n,Goto(s,1)

`;

    // Write to file (adjust path for your Docker setup)
    const dialplanPath = process.env.ASTERISK_DIALPLAN_PATH || 
      '/Users/soft-touch/Desktop/project/callcenter/docker/asterisk/conf/extensions_custom.conf';
    
    try {
      await fs.writeFile(dialplanPath, dialplan);
      console.log('✅ Asterisk dialplan generated successfully');
    } catch (error) {
      console.error('❌ Failed to write Asterisk dialplan:', error.message);
      // Don't throw error - allow API to continue working
    }
  }

  private extractIVROption(conditions: string[]): string | null {
    for (const condition of conditions) {
      const match = condition.match(/IVR Option: (\d+)/i);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  async seedDefaultRules(): Promise<void> {
    const count = await this.routingRepository.count();
    
    if (count === 0) {
      const defaultRules = [
        {
          name: 'VIP Callers',
          priority: 0,
          conditions: ['Caller ID: Ministry Officials', 'Time: 8AM-6PM'],
          destination: 'Senior Agent',
          destinationType: 'agent',
          enabled: true,
          asteriskContext: 'from-external',
          asteriskExtension: '100',
        },
        {
          name: 'Exam Malpractice Reports',
          priority: 1,
          conditions: ['IVR Option: 1', 'Keywords: exam, malpractice, cheating'],
          destination: 'Investigations Queue',
          destinationType: 'queue',
          enabled: true,
          asteriskContext: 'main-ivr',
          asteriskExtension: '1',
        },
        {
          name: 'Teacher Complaints',
          priority: 2,
          conditions: ['IVR Option: 2', 'Keywords: teacher, misconduct'],
          destination: 'HR Queue',
          destinationType: 'queue',
          enabled: true,
          asteriskContext: 'main-ivr',
          asteriskExtension: '2',
        },
        {
          name: 'School Facilities',
          priority: 3,
          conditions: ['IVR Option: 3', 'Keywords: building, infrastructure'],
          destination: 'Facilities Queue',
          destinationType: 'queue',
          enabled: true,
          asteriskContext: 'main-ivr',
          asteriskExtension: '3',
        },
        {
          name: 'After Hours',
          priority: 10,
          conditions: ['Time: 6PM-8AM', 'Weekends'],
          destination: 'Voicemail',
          destinationType: 'voicemail',
          enabled: true,
          asteriskContext: 'from-external',
          asteriskExtension: 's',
        },
      ];

      for (const rule of defaultRules) {
        await this.routingRepository.save(rule);
      }

      await this.generateAsteriskDialplan();
      console.log('✅ Default routing rules seeded');
    }
  }
}
