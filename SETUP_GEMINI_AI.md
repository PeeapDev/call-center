# 🤖 Setup Gemini AI in 2 Minutes

The AI chat system is **already integrated** with Google Gemini Pro!  
You just need to add your API key.

---

## 📋 Quick Setup

### **Step 1: Get Gemini API Key (FREE)**
1. Go to: **https://makersuite.google.com/app/apikey**
2. Click: **"Create API Key"**
3. Copy the key (looks like: `AIzaSyD...`)

### **Step 2: Add to Backend**
```bash
# Open backend .env file
cd backend
nano .env

# Add this line:
GEMINI_API_KEY=AIzaSyD...your_actual_key_here...

# Save and exit (Ctrl+X, then Y, then Enter)
```

### **Step 3: Restart Backend**
```bash
# Kill existing backend
pkill -9 -f "nest start"

# Start fresh
cd backend
npm run start:dev
```

### **Step 4: Test It!**
```
1. Open citizen dashboard
2. Go to: Live Chat
3. Ask: "What are the school fees?"
4. ✅ Get real AI response from Gemini!
```

---

## ✅ What's Already Configured

The AI service (`backend/src/ai/ai.service.ts`) is **fully configured** with:

### **Features:**
- ✅ Google Gemini Pro integration
- ✅ Context-aware responses
- ✅ Training document support
- ✅ Ministry of Education focused
- ✅ Out-of-scope topic filtering
- ✅ Professional responses

### **Settings:**
```typescript
Model: gemini-pro
Temperature: 0.7
Max Tokens: 800
Context: Ministry of Education official documents
```

### **How It Works:**
1. Citizen asks question in chat
2. Frontend sends to: `POST /ai/chat`
3. Backend reads uploaded training documents
4. Adds Ministry of Education context
5. Calls Gemini API with full context
6. Returns professional, accurate response
7. Citizen sees answer instantly

---

## 📚 Training Documents

You can upload official Ministry documents to improve AI responses:

### **How to Add Training Data:**
1. Go to admin: **Settings > AI Config**
2. Upload PDFs/text files with:
   - School fee schedules
   - Registration procedures
   - Exam policies
   - Student guidelines
   - FAQs

### **What Happens:**
- AI reads these documents
- Provides accurate answers from official sources
- Cites specific policies
- More reliable responses

---

## 🧪 Testing AI Responses

### **Test Questions:**
```
✅ Good questions:
- "What are the school registration fees?"
- "How do I apply for admission?"
- "What subjects are required for Form 4?"
- "When do exams start?"
- "How can I contact the Ministry?"

❌ Out-of-scope (AI will politely decline):
- "What's the weather today?"
- "Tell me about sports"
- "Who won the election?"
```

### **Expected Behavior:**
- **In-scope:** Detailed, helpful answer
- **Out-of-scope:** Polite message: "I don't know about that topic, but I'm here to discuss education..."

---

## 🔧 Advanced Configuration

### **Other AI Providers (Optional):**

The system supports multiple AI providers. Add any of these to `.env`:

```bash
# DeepSeek (for advanced analytics)
DEEPSEEK_API_KEY=your_deepseek_key

# OpenAI (for transcription)
OPENAI_API_KEY=your_openai_key

# Anthropic Claude (for reasoning)
ANTHROPIC_API_KEY=your_anthropic_key
```

**Note:** Only Gemini is currently used for citizen chat. Others are for future features.

---

## 🚨 Troubleshooting

### **"AI chat is not configured" Error:**
```bash
# Check if key is in .env
cat backend/.env | grep GEMINI_API_KEY

# Should show: GEMINI_API_KEY=AIza...

# If missing, add it and restart backend
```

### **"I'm currently unable to respond" Error:**
```bash
# Check backend logs
cd backend
# Look for errors in terminal

# Common issues:
# - Invalid API key
# - API key doesn't have permissions
# - Rate limit exceeded (free tier)
```

### **AI Gives Wrong Answers:**
1. Upload more training documents
2. Check if question is in scope
3. Verify training docs are relevant

---

## 💡 Pro Tips

### **Improve AI Accuracy:**
1. **Upload official documents** - FAQs, policies, guidelines
2. **Keep documents updated** - Remove outdated info
3. **Use clear language** - Simple, direct questions work best

### **Monitor AI Usage:**
- Go to: **Settings > AI Keys Management**
- See which keys are configured
- Check API status

---

## 📊 API Limits (Free Tier)

**Gemini API Free Tier:**
- ✅ 60 requests per minute
- ✅ 1,500 requests per day
- ✅ More than enough for a call center

**If you exceed limits:**
- Upgrade to paid tier
- Or wait for quota to reset (1 day)

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend .env has `GEMINI_API_KEY`
- [ ] Backend restarted successfully
- [ ] Citizen chat asks a question
- [ ] AI responds with real answer (not error)
- [ ] Response is relevant to question
- [ ] Out-of-scope questions politely declined

---

## 🎉 You're Done!

**AI is now fully functional!**

Citizens can:
- Ask questions about education
- Get instant AI responses
- Receive accurate information
- Switch to live agent if needed

**Just remember to add your Gemini API key!** 🚀

---

## 🔗 Useful Links

- **Get Gemini API Key:** https://makersuite.google.com/app/apikey
- **Gemini Documentation:** https://ai.google.dev/docs
- **API Limits:** https://ai.google.dev/pricing
- **Training Documents Guide:** See admin Settings > AI Config

**FREE API key = Unlimited AI chat for your call center!** 🎊
