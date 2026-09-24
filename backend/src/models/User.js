'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { ROLES_LIST, ROLES, PATTERNS } = require('../config/constants');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name must be at least 1 character'],
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => PATTERNS.EMPLOYEE_EMAIL.test(v),
        message: (props) => `${props.value} is not a valid email address`,
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, 
    },
    role: {
      type: String,
      enum: {
        values: ROLES_LIST,
        message: '{VALUE} is not a valid role',
      },
      required: [true, 'Role is required'],
      default: ROLES.EMPLOYEE,
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    designation: {
      type: String,
      trim: true,
      default: null,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
    },
    employeeCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },
    refreshTokenVersion: {
      
      type: Number,
      default: 0,
      select: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.refreshTokenVersion;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// INDEXES
userSchema.index({ role: 1, department: 1 });
userSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// VIRTUALS
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// HOOKS
// Hash password before saving, whenever it's new or modified
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    if (!this.isNew) {
      this.passwordChangedAt = new Date(Date.now() - 1000);
    }

    next();
  } catch (err) {
    next(err);
  }
});

// INSTANCE METHODS
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function changedPasswordAfter(jwtIat) {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIat < changedTimestamp;
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return rawToken;
};

userSchema.methods.invalidateTokens = function invalidateTokens() {
  this.refreshTokenVersion += 1;
};

// STATIC METHODS
userSchema.statics.findByEmailWithPassword = function findByEmailWithPassword(email) {
  return this.findOne({ email: email.toLowerCase().trim(), isActive: true }).select('+password');
};

module.exports = mongoose.model('User', userSchema);