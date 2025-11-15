# 🔐 Complete Authentication & Feature Implementation Guide

## 📊 Overview

This guide covers the complete implementation of:
1. ✅ **Fixed Footer Navigation** - Already implemented
2. 🚧 **Backend Authentication System** - Full user registration & login
3. 🚧 **Mobile Setup Wizard** - First-time user onboarding
4. 🚧 **Incoming Call Detection** - Prevent conflicts with phone calls
5. 🚧 **Redesigned Mobile Dashboard** - Modern citizen dashboard
6. 🚧 **Web Citizen Login** - Citizens can access web portal
7. 🚧 **Real Staff Accounts** - No more mock data

---

## ✅ 1. Fixed Footer Navigation (DONE)

### Changes Made:
- **File**: `mobile-app/ministry-call-center/src/components/BottomNavigation.tsx`
- **Fix**: Added `position: 'absolute'`, `bottom: 0`, `left: 0`, `right: 0`
- **Result**: Footer now stays fixed at bottom, won't disappear when clicking "My Cases"

---

## 🚧 2. Backend Authentication System

### Step 1: Install Dependencies

Already started installation of:
```bash
npm install --save bcrypt @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/bcrypt @types/passport-jwt
```

### Step 2: Create User Entity

**File**: `backend/src/auth/user.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserType {
  CITIZEN = 'citizen',
  STAFF = 'staff',
  ADMIN = 'admin',
}

export enum CitizenRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  OTHER = 'other',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  password: string; // Hashed

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'varchar',
    enum: UserType,
    default: UserType.CITIZEN,
  })
  userType: UserType;

  @Column({
    type: 'varchar',
    enum: CitizenRole,
    nullable: true,
  })
  citizenRole?: CitizenRole;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  setupCompleted: boolean;

  @Column({ nullable: true })
  staffId: string; // For staff members

  @Column({ nullable: true })
  extension: string; // For staff phone extension

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;
}
```

### Step 3: Create DTOs

**File**: `backend/src/auth/dto/register.dto.ts`

```typescript
import { IsString, IsNotEmpty, Matches, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserType } from '../user.entity';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9\s\-()]+$/, { message: 'Phone number must be valid' })
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CompleteSetupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  citizenRole?: string; // student, parent, teacher, other
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  verificationCode: string; // SMS code

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
```

### Step 4: Auth Service

**File**: `backend/src/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserType } from './user.entity';
import { RegisterDto, LoginDto, CompleteSetupDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ token: string; user: any }> {
    const { phoneNumber, password, userType } = registerDto;

    // Format phone number
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { phoneNumber: formattedPhone },
    });

    if (existingUser) {
      throw new ConflictException('An account with this phone number already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      phoneNumber: formattedPhone,
      password: hashedPassword,
      userType: userType || UserType.CITIZEN,
      isActive: true,
      setupCompleted: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate token
    const token = this.generateToken(savedUser);

    return {
      token,
      user: this.sanitizeUser(savedUser),
    };
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user: any }> {
    const { phoneNumber, password } = loginDto;

    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const user = await this.userRepository.findOne({
      where: { phoneNumber: formattedPhone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const token = this.generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async completeSetup(userId: string, setupDto: CompleteSetupDto): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.name = setupDto.name;
    user.citizenRole = setupDto.citizenRole as any;
    user.setupCompleted = true;

    const updatedUser = await this.userRepository.save(user);

    return this.sanitizeUser(updatedUser);
  }

  async requestPasswordReset(phoneNumber: string): Promise<{ message: string }> {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const user = await this.userRepository.findOne({
      where: { phoneNumber: formattedPhone },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If this number exists, a verification code has been sent' };
    }

    // TODO: Implement SMS service to send verification code
    // For now, just log it (in production, send SMS)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📱 Verification code for ${formattedPhone}: ${verificationCode}`);

    // TODO: Store verification code with expiry in database or cache

    return { message: 'If this number exists, a verification code has been sent' };
  }

  private formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/\s/g, '');
    if (formatted.startsWith('0')) {
      formatted = '+232' + formatted.substring(1);
    } else if (!formatted.startsWith('+232')) {
      formatted = '+232' + formatted;
    }
    return formatted;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User): any {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  async createStaffAccount(staffData: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(staffData.password, 10);

    const staff = this.userRepository.create({
      phoneNumber: this.formatPhoneNumber(staffData.phoneNumber),
      password: hashedPassword,
      name: staffData.name,
      userType: UserType.STAFF,
      staffId: staffData.staffId,
      extension: staffData.extension,
      isActive: true,
      setupCompleted: true,
    });

    return await this.userRepository.save(staff);
  }
}
```

### Step 5: Auth Controller

**File**: `backend/src/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, CompleteSetupDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('setup/complete')
  @UseGuards(JwtAuthGuard)
  async completeSetup(@Request() req, @Body() setupDto: CompleteSetupDto) {
    return await this.authService.completeSetup(req.user.sub, setupDto);
  }

  @Post('password/reset-request')
  async requestPasswordReset(@Body('phoneNumber') phoneNumber: string) {
    return await this.authService.requestPasswordReset(phoneNumber);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('staff/create')
  @UseGuards(JwtAuthGuard)
  // TODO: Add admin guard
  async createStaff(@Body() staffData: any) {
    return await this.authService.createStaffAccount(staffData);
  }
}
```

---

## 🚧 3. Mobile Setup Wizard

### Screen Flow:
```
First Launch → Welcome → Registration → Setup Wizard → Welcome Animation → Dashboard
Subsequent Launches → Dashboard (if logged in)
```

### File Structure:
```
mobile-app/ministry-call-center/src/
├── screens/
│   ├── onboarding/
│   │   ├── WelcomeScreen.tsx          ← First screen
│   │   ├── RegistrationScreen.tsx     ← Phone + Password
│   │   ├── SetupStep1Screen.tsx       ← "What should we call you?"
│   │   ├── SetupStep2Screen.tsx       ← "Are you a student or parent?"
│   │   ├── SetupStep3Screen.tsx       ← Additional info (optional)
│   │   └── WelcomeAnimationScreen.tsx ← Success animation
│   └── dashboard/
│       ├── CitizenDashboard.tsx       ← New modern dashboard
│       └── StaffDashboard.tsx
└── services/
    └── auth.service.ts                ← Auth API calls
```

### Implementation:

**File**: `mobile-app/ministry-call-center/src/screens/onboarding/RegistrationScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { authService } from '../../services/auth.service';

export default function RegistrationScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(phoneNumber, password);
      
      // Save token
      await authService.saveToken(response.token);
      
      // Navigate to setup wizard
      navigation.navigate('SetupStep1', { userId: response.user.id });
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Unable to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Register with your phone number to access the Ministry of Education services
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number (e.g., 076 123 456)"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          autoFocus
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 6 characters)"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    lineHeight: 24,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLinkBold: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
});
```

---

## 🚧 4. Incoming Call Detection

### Android: Uses PhoneStateListener
### iOS: Uses CallKit

**File**: `mobile-app/ministry-call-center/src/services/call-state.service.ts`

```typescript
import { Platform, PermissionsAndroid } from 'react-native';
// You'll need to install: react-native-call-detection or similar

class CallStateService {
  private isInCall: boolean = false;
  private listeners: ((inCall: boolean) => void)[] = [];

  async initialize() {
    if (Platform.OS === 'android') {
      await this.requestAndroidPermissions();
    }
    // Initialize call detection
    // This requires native module setup
  }

  async requestAndroidPermissions() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        {
          title: 'Phone State Permission',
          message: 'This app needs access to detect incoming calls to prevent conflicts',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  isPhoneInCall(): boolean {
    return this.isInCall;
  }

  addListener(callback: (inCall: boolean) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (inCall: boolean) => void) {
    this.listeners = this.listeners.filter((cb) => cb !== callback);
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.isInCall));
  }
}

export const callStateService = new CallStateService();
```

### Usage in CallScreen:

```typescript
const makeCall = async () => {
  // Check if phone is in call
  if (callStateService.isPhoneInCall()) {
    Alert.alert(
      'Phone Busy',
      'You are currently in a call. Please end your current call before making a new one.',
      [{ text: 'OK' }]
    );
    return;
  }

  // Proceed with call...
};
```

---

## 🚧 5. Redesigned Citizen Dashboard

**File**: `mobile-app/ministry-call-center/src/screens/dashboard/CitizenDashboard.tsx`

Modern dashboard with:
- Quick action cards
- Recent activity
- Emergency banner
- Service shortcuts

(Full implementation in next section)

---

## 🚧 6. Web Citizen Login

### Changes to Web Frontend:

**File**: `frontend/src/app/login/page.tsx`

Change "Staff Account" button to "Login"
Add toggle for Citizen/Staff login
Separate authentication flows

---

## 📦 Installation Commands

```bash
# Backend
cd backend
npm install bcrypt @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/bcrypt @types/passport-jwt

# Mobile
cd mobile-app/ministry-call-center
npm install react-native-lottie-splash-screen lottie-react-native
npm install react-native-call-detection
```

---

## 🧪 Testing

1. **Test Backend Registration**:
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+232 76 123 456", "password": "password123"}'
```

2. **Test Backend Login**:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+232 76 123 456", "password": "password123"}'
```

3. **Test Mobile Registration Flow**:
- Open app → Should show Welcome screen
- Register with phone + password
- Complete setup wizard
- See welcome animation
- Land on new dashboard

---

## 📚 Next Steps

1. Implement backend auth (entities, services, controllers)
2. Add JWT strategy and guards
3. Create mobile setup wizard screens
4. Implement call detection
5. Design new dashboard
6. Update web login
7. Create staff management

Would you like me to continue with the full implementation of any specific part?
