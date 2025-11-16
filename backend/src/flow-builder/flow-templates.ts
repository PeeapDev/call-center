/**
 * Flow Builder Templates for IVR
 * Pre-built templates that can be used as defaults or edited
 */

export interface FlowNode {
  id: string;
  type: 'welcome' | 'menu' | 'input' | 'action' | 'end' | 'agent' | 'condition';
  message: string;
  audioUrl?: string;
  audioSubcategory?: string; // Maps to media subcategory
  options?: FlowOption[];
  nextNode?: string;
  // Agent-specific fields
  assignedAgents?: string[]; // Agent IDs
  // Condition-specific fields
  conditionType?: 'agent_available' | 'time_check' | 'queue_time' | 'custom';
  conditionValue?: any;
}

export interface FlowOption {
  key: string;
  label: string;
  nextNode: string;
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  isDefault?: boolean;
}

/**
 * Template 1: Simple 4-Option IVR (Ministry of Education - Current)
 */
export const SIMPLE_FOUR_OPTION_TEMPLATE: FlowTemplate = {
  id: 'simple-four-option',
  name: 'Simple 4-Option IVR',
  description: 'Basic IVR with 4 service options - Ministry of Education',
  isDefault: true,
  nodes: [
     {
       id: 'welcome',
       type: 'welcome',
       message:
         'Welcome to the Ministry of Education Call Center. Your call is important to us.',
       audioSubcategory: 'welcome',
       nextNode: 'main-menu',
     },
     {
       id: 'main-menu',
       type: 'menu',
       message:
         'Please select from the following options: Press 1 for Exam Malpractice Reports. Press 2 for Teacher Issues and Complaints. Press 3 for Student Welfare Concerns. Press 4 for General Education Inquiries. Press 0 to speak with an operator.',
       audioSubcategory: 'menu',
       options: [
         { key: '1', label: 'Exam Malpractice', nextNode: 'queue-exam' },
         { key: '2', label: 'Teacher Issues', nextNode: 'queue-teacher' },
         { key: '3', label: 'Student Welfare', nextNode: 'queue-student' },
         { key: '4', label: 'General Inquiry', nextNode: 'queue-general' },
         { key: '0', label: 'Operator', nextNode: 'queue-operator' },
       ],
     },
     {
       id: 'queue-exam',
       type: 'action',
       message:
         'Thank you. You will be connected to our Exam Malpractice department. Please hold while we transfer your call.',
       audioSubcategory: 'exam',
       nextNode: 'end',
     },
     {
       id: 'queue-teacher',
       type: 'action',
       message:
         'Thank you. You will be connected to our Teacher Support department. Please hold while we transfer your call.',
       audioSubcategory: 'teacher',
       nextNode: 'end',
     },
     {
       id: 'queue-student',
       type: 'action',
       message:
         'Thank you. You will be connected to our Student Welfare department. Please hold while we transfer your call.',
       audioSubcategory: 'student',
       nextNode: 'end',
     },
     {
       id: 'queue-general',
       type: 'action',
       message:
         'Thank you. You will be connected to a general support agent. Please hold while we transfer your call.',
       audioSubcategory: 'general',
       nextNode: 'end',
     },
     {
       id: 'queue-operator',
       type: 'action',
       message:
         'Please hold while we connect you to an operator.',
       audioSubcategory: 'operator',
       nextNode: 'end',
     },
    {
      id: 'end',
      type: 'end',
      message: 'Thank you for calling the Ministry of Education. Have a great day.',
    },
  ],
};

/**
 * Template 2: Advanced Multi-Level IVR
 */
export const ADVANCED_MULTILEVEL_TEMPLATE: FlowTemplate = {
  id: 'advanced-multilevel',
  name: 'Advanced Multi-Level IVR',
  description: 'Complex IVR with sub-menus and detailed routing',
  nodes: [
    {
      id: 'welcome',
      type: 'welcome',
      message:
        'Welcome to the Ministry of Education Sierra Leone. For English, press 1. For Krio, press 2.',
      options: [
        { key: '1', label: 'English', nextNode: 'main-menu-en' },
        { key: '2', label: 'Krio', nextNode: 'main-menu-kr' },
      ],
    },
    {
      id: 'main-menu-en',
      type: 'menu',
      message:
        'Main Menu. Press 1 for School-Related Issues. Press 2 for Exam Services. Press 3 for Teacher Services. Press 4 for Student Services. Press 9 to repeat this menu. Press 0 for an operator.',
      options: [
        { key: '1', label: 'School Issues', nextNode: 'school-submenu' },
        { key: '2', label: 'Exam Services', nextNode: 'exam-submenu' },
        { key: '3', label: 'Teacher Services', nextNode: 'teacher-submenu' },
        { key: '4', label: 'Student Services', nextNode: 'student-submenu' },
        { key: '9', label: 'Repeat Menu', nextNode: 'main-menu-en' },
        { key: '0', label: 'Operator', nextNode: 'queue-operator' },
      ],
    },
    {
      id: 'school-submenu',
      type: 'menu',
      message:
        'School Issues. Press 1 for School Registration. Press 2 for Infrastructure Problems. Press 3 to Report Corruption. Press 0 to return to main menu.',
      options: [
        { key: '1', label: 'Registration', nextNode: 'queue-school-reg' },
        { key: '2', label: 'Infrastructure', nextNode: 'queue-infrastructure' },
        { key: '3', label: 'Corruption Report', nextNode: 'queue-corruption' },
        { key: '0', label: 'Main Menu', nextNode: 'main-menu-en' },
      ],
    },
    {
      id: 'exam-submenu',
      type: 'menu',
      message:
        'Exam Services. Press 1 to Report Malpractice. Press 2 for Exam Results Inquiry. Press 3 for Exam Registration. Press 0 to return to main menu.',
      options: [
        { key: '1', label: 'Malpractice', nextNode: 'queue-malpractice' },
        { key: '2', label: 'Results', nextNode: 'queue-results' },
        { key: '3', label: 'Registration', nextNode: 'queue-exam-reg' },
        { key: '0', label: 'Main Menu', nextNode: 'main-menu-en' },
      ],
    },
    {
      id: 'teacher-submenu',
      type: 'menu',
      message:
        'Teacher Services. Press 1 for Salary Issues. Press 2 to Report Teacher Misconduct. Press 3 for Training Programs. Press 0 to return to main menu.',
      options: [
        { key: '1', label: 'Salary', nextNode: 'queue-salary' },
        { key: '2', label: 'Misconduct', nextNode: 'queue-teacher-misconduct' },
        { key: '3', label: 'Training', nextNode: 'queue-training' },
        { key: '0', label: 'Main Menu', nextNode: 'main-menu-en' },
      ],
    },
    {
      id: 'student-submenu',
      type: 'menu',
      message:
        'Student Services. Press 1 for Bullying Reports. Press 2 for Special Needs Support. Press 3 for Scholarship Information. Press 0 to return to main menu.',
      options: [
        { key: '1', label: 'Bullying', nextNode: 'queue-bullying' },
        { key: '2', label: 'Special Needs', nextNode: 'queue-special-needs' },
        { key: '3', label: 'Scholarships', nextNode: 'queue-scholarship' },
        { key: '0', label: 'Main Menu', nextNode: 'main-menu-en' },
      ],
    },
    // Queue endpoints
    {
      id: 'queue-operator',
      type: 'action',
      message: 'Connecting you to an operator. Please hold.',
      nextNode: 'end',
    },
    {
      id: 'queue-malpractice',
      type: 'action',
      message: 'Thank you for reporting exam malpractice. Your call is being recorded. An agent will assist you shortly.',
      nextNode: 'end',
    },
    // ... other queue nodes would follow the same pattern
    {
      id: 'end',
      type: 'end',
      message: 'Thank you for calling. Goodbye.',
    },
  ],
};

/**
 * Template 3: Emergency Hotline IVR
 */
export const EMERGENCY_HOTLINE_TEMPLATE: FlowTemplate = {
  id: 'emergency-hotline',
  name: 'Emergency Hotline IVR',
  description: 'Fast-track IVR for urgent education emergencies',
  nodes: [
    {
      id: 'welcome',
      type: 'welcome',
      message:
        'Ministry of Education Emergency Hotline. If this is a life-threatening emergency, please hang up and dial 999.',
      nextNode: 'emergency-check',
    },
    {
      id: 'emergency-check',
      type: 'menu',
      message:
        'Press 1 if this is an urgent emergency requiring immediate response. Press 2 for non-urgent but important matters. Press 3 for general inquiries.',
      options: [
        { key: '1', label: 'Urgent Emergency', nextNode: 'urgent-menu' },
        { key: '2', label: 'Important', nextNode: 'non-urgent-menu' },
        { key: '3', label: 'General', nextNode: 'queue-general' },
      ],
    },
    {
      id: 'urgent-menu',
      type: 'menu',
      message:
        'Urgent Emergency. Press 1 for School Safety Issue. Press 2 for Student in Danger. Press 3 for Teacher Emergency. All urgent calls are prioritized.',
      options: [
        { key: '1', label: 'School Safety', nextNode: 'queue-urgent-safety' },
        { key: '2', label: 'Student Danger', nextNode: 'queue-urgent-student' },
        { key: '3', label: 'Teacher Emergency', nextNode: 'queue-urgent-teacher' },
      ],
    },
    {
      id: 'non-urgent-menu',
      type: 'menu',
      message:
        'Important Matters. Press 1 for Immediate Suspension. Press 2 for Security Concerns. Press 3 for Health Issues.',
      options: [
        { key: '1', label: 'Suspension', nextNode: 'queue-suspension' },
        { key: '2', label: 'Security', nextNode: 'queue-security' },
        { key: '3', label: 'Health', nextNode: 'queue-health' },
      ],
    },
    {
      id: 'queue-urgent-safety',
      type: 'action',
      message:
        'URGENT: Connecting you immediately to emergency response team. Stay on the line. Your location may be traced for assistance.',
      nextNode: 'end',
    },
    {
      id: 'queue-urgent-student',
      type: 'action',
      message:
        'URGENT: Student safety call. Connecting to priority response team immediately. Please stay on the line.',
      nextNode: 'end',
    },
    {
      id: 'queue-urgent-teacher',
      type: 'action',
      message:
        'URGENT: Teacher emergency. Connecting to response team now. Please remain on the line.',
      nextNode: 'end',
    },
    {
      id: 'queue-general',
      type: 'action',
      message: 'Connecting you to the next available agent. Please hold.',
      nextNode: 'end',
    },
    {
      id: 'end',
      type: 'end',
      message: 'Thank you for calling. Stay safe.',
    },
  ],
};

/**
 * Get all available templates
 */
export function getAllTemplates(): FlowTemplate[] {
  return [
    SIMPLE_FOUR_OPTION_TEMPLATE,
    ADVANCED_MULTILEVEL_TEMPLATE,
    EMERGENCY_HOTLINE_TEMPLATE,
  ];
}

/**
 * Get default template
 */
export function getDefaultTemplate(): FlowTemplate {
  return SIMPLE_FOUR_OPTION_TEMPLATE;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): FlowTemplate | undefined {
  const templates = getAllTemplates();
  return templates.find((t) => t.id === id);
}

/**
 * Validate flow template structure
 */
export function validateTemplate(template: FlowTemplate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if template has nodes
  if (!template.nodes || template.nodes.length === 0) {
    errors.push('Template must have at least one node');
  }

  // Check if there's a welcome node
  const hasWelcome = template.nodes.some((n) => n.type === 'welcome');
  if (!hasWelcome) {
    errors.push('Template must have a welcome node');
  }

  // Check if all nextNode references exist
  template.nodes.forEach((node) => {
    if (node.nextNode) {
      const exists = template.nodes.some((n) => n.id === node.nextNode);
      if (!exists) {
        errors.push(`Node ${node.id} references non-existent node ${node.nextNode}`);
      }
    }

    // Check menu options
    if (node.options) {
      node.options.forEach((option) => {
        const exists = template.nodes.some((n) => n.id === option.nextNode);
        if (!exists) {
          errors.push(`Option ${option.key} in node ${node.id} references non-existent node ${option.nextNode}`);
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
