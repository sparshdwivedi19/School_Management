const { getOpenAIClient } = require('../config/openai');
const { buildSchoolContext, buildStudentContext } = require('../services/contextBuilder.service');
const AIInsight = require('../models/AIInsight.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// System prompts per role
const SYSTEM_PROMPTS = {
  principal: `You are an AI-powered School Management Assistant for Suncity School. 
You have access to real-time school data including student numbers, fee collection, attendance, exam results, and financial information.
Provide concise, insightful, and actionable responses to help the Principal manage the school effectively.
Always base your answers on the data provided. Format responses clearly with bullet points where appropriate.
If asked about specific student names or sensitive individual data not in your context, politely decline and suggest using the ERP system directly.`,

  accountant: `You are Suncity School's AI Financial Advisor.
You have access to real-time fee collection, expense, and salary data.
Help analyze financial patterns, identify defaulters, suggest collection strategies, and answer questions about the school's financial health.
Always cite specific numbers from the context. Format monetary values in Indian rupees (₹).`,

  student: `You are a friendly and encouraging AI Study Coach for a student at Suncity School.
You have access to this student's attendance record, exam results, and fee status.
Help the student understand their academic performance, suggest improvements, and answer questions about their school life.
Be motivating, warm, and constructive. Never be negative or discouraging. Use simple language.`,
};

// @desc    Send message to AI (SSE streaming)
// @route   POST /api/v1/ai/chat
// @access  Protected
exports.chat = asyncHandler(async (req, res, next) => {
  const { message, mode = 'principal', academicSession = '2025-26' } = req.body;

  if (!message || !message.trim()) {
    return next(new ApiError(400, 'Message is required'));
  }

  let context;
  try {
    if (mode === 'student') {
      context = await buildStudentContext(req.user.referenceId || req.user.id, academicSession);
    } else {
      context = await buildSchoolContext(academicSession);
    }
  } catch (err) {
    context = 'Context data unavailable. Please answer based on general school management knowledge.';
  }

  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.principal;

  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: `${systemPrompt}\n\n${context}` },
        { role: 'user', content: message },
      ],
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ delta, done: false })}\n\n`);
      }
    }

    // Signal completion
    res.write(`data: ${JSON.stringify({ delta: '', done: true })}\n\n`);
    res.end();

    // Persist insight (fire-and-forget)
    AIInsight.create({
      role: mode,
      question: message,
      answer: fullResponse,
      askedBy: req.user.id,
      academicSession,
    }).catch(() => {});

  } catch (err) {
    if (err.message?.includes('OPENAI_API_KEY')) {
      res.write(`data: ${JSON.stringify({ error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.', done: true })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.', done: true })}\n\n`);
    }
    res.end();
  }
});

// @desc    Get AI insight history
// @route   GET /api/v1/ai/history
// @access  Protected
exports.getHistory = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const filter = { askedBy: req.user.id };
  if (req.query.mode) filter.role = req.query.mode;

  const insights = await AIInsight.find(filter)
    .sort('-createdAt')
    .limit(Number(limit))
    .select('question answer role createdAt feedback');

  res.status(200).json(new ApiResponse(200, { insights }, 'AI history retrieved'));
});

// @desc    Submit feedback on an AI response
// @route   PUT /api/v1/ai/:id/feedback
// @access  Protected
exports.submitFeedback = asyncHandler(async (req, res, next) => {
  const { helpful } = req.body;
  const insight = await AIInsight.findByIdAndUpdate(
    req.params.id,
    { feedback: helpful ? 'helpful' : 'not_helpful' },
    { new: true }
  );
  if (!insight) return next(new ApiError(404, 'Insight not found'));
  res.status(200).json(new ApiResponse(200, { insight }, 'Feedback recorded'));
});
