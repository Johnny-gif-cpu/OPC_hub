// ============================================================
// Pandora X — Mongoose 数据模型
// 替代原来的 node:sqlite，所有表映射为 Mongoose Schema。
// ============================================================
import mongoose from 'mongoose';

// ------------------------------------------------------------
// User
// ------------------------------------------------------------
const userSchema = new mongoose.Schema({
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, required: true },
  name:        { type: String, default: '' },
  avatar:      { type: String, default: '🧑‍🚀' },
  headline:    { type: String, default: '' },
  bio:         { type: String, default: '' },
  is_demo:     { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// Index for login lookup
userSchema.index({ email: 1 });

export const User = mongoose.model('User', userSchema);

// ------------------------------------------------------------
// Session
// ------------------------------------------------------------
const sessionSchema = new mongoose.Schema({
  token:       { type: String, required: true, unique: true },
  user_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expires_at:  { type: Date, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

sessionSchema.index({ token: 1 });
sessionSchema.index({ user_id: 1 });

export const Session = mongoose.model('Session', sessionSchema);

// ------------------------------------------------------------
// VerificationCode
// ------------------------------------------------------------
const verificationCodeSchema = new mongoose.Schema({
  email:       { type: String, required: true, lowercase: true, trim: true },
  code:        { type: String, required: true },
  expires_at:  { type: Date, required: true },
  used:        { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

verificationCodeSchema.index({ email: 1, used: 1 });

export const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

// ------------------------------------------------------------
// Skill
// ------------------------------------------------------------
const skillSchema = new mongoose.Schema({
  _id:         { type: String },  // custom short id (s1, s2, u_xxx)
  title:       { type: String, required: true },
  descr:       { type: String, required: true },
  category:    { type: String, required: true },
  skill_kind:  { type: String, enum: ['daily', 'commercial'], default: 'daily' },
  downloads:   { type: String, default: '0' },
  slug:        { type: String },
  status:      { type: String, default: '已发布' },
  author_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  author_email:{ type: String, default: '' },
  is_hot:      { type: Boolean, default: false },
  sort:        { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, _id: false });

// Allow both custom string _id and auto ObjectId
skillSchema.index({ category: 1 });
skillSchema.index({ skill_kind: 1 });

export const Skill = mongoose.model('Skill', skillSchema);

// ------------------------------------------------------------
// Request
// ------------------------------------------------------------
const requestSchema = new mongoose.Schema({
  _id:         { type: String },
  title:       { type: String, required: true },
  budget:      { type: String, default: '' },
  deadline:    { type: String, default: '' },
  status:      { type: String, default: '招募中' },
  category:    { type: String, default: '' },
  publisher:   { type: String, default: '' },
  summary:     { type: String, default: '' },
  sort:        { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, _id: false });

export const Request = mongoose.model('Request', requestSchema);

// ------------------------------------------------------------
// Pioneer
// ------------------------------------------------------------
const pioneerSchema = new mongoose.Schema({
  _id:         { type: Number },  // rank
  name:        { type: String, required: true },
  role:        { type: String, default: '' },
  metric:      { type: String, default: '' },
  badge:       { type: String, default: '' },
}, { _id: false });

export const Pioneer = mongoose.model('Pioneer', pioneerSchema);

// ------------------------------------------------------------
// Follow
// ------------------------------------------------------------
const followSchema = new mongoose.Schema({
  follower_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

followSchema.index({ follower_id: 1, followee_id: 1 }, { unique: true });
followSchema.index({ follower_id: 1 });
followSchema.index({ followee_id: 1 });

export const Follow = mongoose.model('Follow', followSchema);

// ------------------------------------------------------------
// Conversation
// ------------------------------------------------------------
const conversationSchema = new mongoose.Schema({
  user_a:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_b:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

conversationSchema.index({ user_a: 1, user_b: 1 }, { unique: true });
conversationSchema.index({ user_a: 1 });
conversationSchema.index({ user_b: 1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);

// ------------------------------------------------------------
// Message
// ------------------------------------------------------------
const messageSchema = new mongoose.Schema({
  conv_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body:        { type: String, required: true },
  read_at:     { type: Date, default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

messageSchema.index({ conv_id: 1 });

export const Message = mongoose.model('Message', messageSchema);
