'use strict';

const mongoose = require('mongoose');
const { TICKET_CODE_PREFIX, ASSET_CODE_PREFIX } = require('../config/constants');

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, 
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const getNextSequence = async (counterKey) => {
  const updatedCounter = await Counter.findOneAndUpdate(
    { _id: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return updatedCounter.seq;
};

const padSequence = (num, width = 6) => String(num).padStart(width, '0');

const generateTicketCode = async () => {
  const seq = await getNextSequence('ticket_code');
  return `${TICKET_CODE_PREFIX}-${padSequence(seq)}`;
};

const generateAssetCode = async () => {
  const seq = await getNextSequence('asset_code');
  return `${ASSET_CODE_PREFIX}-${padSequence(seq)}`;
};

const resetCounter = async (counterKey, value = 0) => {
  await Counter.findOneAndUpdate(
    { _id: counterKey },
    { $set: { seq: value } },
    { upsert: true }
  );
};

module.exports = {
  Counter,
  getNextSequence,
  generateTicketCode,
  generateAssetCode,
  resetCounter,
};