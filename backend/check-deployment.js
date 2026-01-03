/**
 * Deployment Diagnostics Script
 * Run this on your backend to check if all environment variables are properly configured
 * 
 * Usage: node check-deployment.js
 */

import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

console.log('\n🔍 GhostChat Backend Deployment Diagnostics\n');
console.log('='.repeat(60));

const checks = {
  '✅ MONGO_URI': !!process.env.MONGO_URI,
  '✅ JWT_SECRET': !!process.env.JWT_SECRET,
  '✅ ENCRYPTION_KEY': !!process.env.ENCRYPTION_KEY,
  '✅ CLIENT_URL': !!process.env.CLIENT_URL,
  '✅ PORT': !!process.env.PORT,
};

// Detailed checks
console.log('\n📋 Environment Variables Status:\n');

Object.entries(checks).forEach(([key, value]) => {
  const status = value ? '✅ SET' : '❌ MISSING';
  console.log(`${status} - ${key.replace('✅ ', '')}`);
});

// Validation checks
console.log('\n🔐 Validation Checks:\n');

// Check JWT_SECRET length
if (process.env.JWT_SECRET) {
  const jwtLength = process.env.JWT_SECRET.length;
  if (jwtLength >= 32) {
    console.log(`✅ JWT_SECRET length: ${jwtLength} characters (Good)`);
  } else {
    console.log(`⚠️  JWT_SECRET length: ${jwtLength} characters (Should be at least 32)`);
  }
} else {
  console.log('❌ JWT_SECRET is not set');
}

// Check ENCRYPTION_KEY length
if (process.env.ENCRYPTION_KEY) {
  const encLength = process.env.ENCRYPTION_KEY.length;
  if (encLength === 32) {
    console.log(`✅ ENCRYPTION_KEY length: ${encLength} characters (Perfect)`);
  } else {
    console.log(`❌ ENCRYPTION_KEY length: ${encLength} characters (Must be exactly 32)`);
  }
} else {
  console.log('❌ ENCRYPTION_KEY is not set');
}

// Check MongoDB URI format
if (process.env.MONGO_URI) {
  const isValidFormat = process.env.MONGO_URI.startsWith('mongodb://') || 
                        process.env.MONGO_URI.startsWith('mongodb+srv://');
  if (isValidFormat) {
    console.log('✅ MONGO_URI format looks valid');
  } else {
    console.log('⚠️  MONGO_URI format might be incorrect');
  }
} else {
  console.log('❌ MONGO_URI is not set');
}

// Check CLIENT_URL format
if (process.env.CLIENT_URL) {
  const isValidUrl = process.env.CLIENT_URL.startsWith('http://') || 
                     process.env.CLIENT_URL.startsWith('https://');
  if (isValidUrl) {
    console.log(`✅ CLIENT_URL: ${process.env.CLIENT_URL}`);
  } else {
    console.log(`⚠️  CLIENT_URL should start with http:// or https://`);
  }
} else {
  console.log('⚠️  CLIENT_URL is not set (will default to http://localhost:3000)');
}

// Overall status
console.log('\n' + '='.repeat(60));
const allSet = Object.values(checks).every(v => v);
if (allSet) {
  console.log('\n✅ All required environment variables are set!');
  console.log('✅ Your backend should be ready for deployment.\n');
} else {
  console.log('\n❌ Some environment variables are missing!');
  console.log('⚠️  Please check the DEPLOYMENT_FIX.md guide for setup instructions.\n');
}

// Generate sample keys if needed
console.log('='.repeat(60));
console.log('\n💡 Need to generate secure keys? Use these:\n');
console.log('For JWT_SECRET (64 chars):');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('\nFor ENCRYPTION_KEY (32 chars):');
console.log(crypto.randomBytes(16).toString('hex'));
console.log('\n');
