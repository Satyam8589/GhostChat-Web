import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Get the Message model
    const Message = mongoose.model('Message', new mongoose.Schema({}, { strict: false }));
    
    // Find the latest message
    const latestMessage = await Message.findOne().sort({ createdAt: -1 }).limit(1);
    
    if (!latestMessage) {
      console.log('❌ No messages found in database');
      process.exit(0);
    }
    
    console.log('📝 Latest Message in Database:\n');
    console.log('Message ID:', latestMessage._id);
    console.log('Created At:', latestMessage.createdAt);
    console.log('Message Type:', latestMessage.messageType);
    console.log('\n🔍 Encryption Check:\n');
    
    const content = latestMessage.encryptedContent || latestMessage.content;
    console.log('Content Field:', content);
    console.log('Content Length:', content?.length || 0);
    
    // Check if encrypted
    const isEncrypted = content && content.includes(':') && content.split(':').length === 2;
    const parts = content?.split(':') || [];
    
    if (isEncrypted) {
      console.log('\n✅ MESSAGE IS ENCRYPTED!');
      console.log('   IV Length:', parts[0]?.length, '(should be 32)');
      console.log('   Data Length:', parts[1]?.length);
      console.log('   Format: iv:encryptedData ✅');
    } else {
      console.log('\n❌ MESSAGE IS NOT ENCRYPTED!');
      console.log('   This is plain text:', content);
      console.log('   Expected format: iv:encryptedData');
    }
    
    console.log('\n' + '='.repeat(60));
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  });
