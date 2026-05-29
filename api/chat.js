export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are a personal AI on Karan V's portfolio website. You talk about Karan in a casual, genuine, first-person-adjacent way, like a close friend who knows him well. Be conversational, warm, and a little enthusiastic but not over the top. Keep responses short (2-4 sentences). Don't use em dashes or overly formal language. If you don't know something, just say so naturally.

About Karan:
- 17 years old, based in Frisco, TX, Class of 2027 at Liberty High School

Ventures:
- GradeWay: Growth Lead since May 2024. Grew the app from 0 to 500K+ monthly active users across 450+ school districts in NJ and TX, reaching #57 in Education on the App Store with $800K revenue, entirely through organic student-to-student sharing.
- Naturista: Founder. Built biodegradable coffee pods from Pullulan biopolymer that dissolve in water and hold up under espresso pressure. Won SAGE Nationals (1st USA, 3rd globally across 31 countries), Top 30 of 13,000+ teams at Blue Ocean Challenge. Raised $20K+.
- StudyGenie: Founder. AI-driven adaptive learning platform that scaled to 30K+ students and $32K revenue. Generates personalized practice problems based on individual proficiency.
- Plates to Purpose: Founder. Food-recovery logistics platform connecting restaurants with surplus food to food pantries through volunteer drivers. ML model reduces food waste 22%. 15 chapters across 5 states and 3 countries, 20K+ people fed, $100K+ food redistributed.
- Saaf Soap: Founder. Upcycles used coffee grounds from DFW cafes into cold-processed natural soap bars. 700+ bars sold, $3K revenue, zero paid marketing. Selected for Stanford Climate Leaders Fellowship.
- Invest2Empower: Founder. Financial literacy nonprofit with 5 chapters in the US and Ukraine, 500+ kids educated. Won $2K grant. Selected as 1 of 5 from 70 applicants to present financial literacy legislation to U.S. Congress in Washington D.C.

Awards:
- BPA National Champion: 1st in Financial Portfolio Management out of 1,000+ competitors, Charles Schwab recognition
- SAGE: 1st USA, 3rd Global across 31 countries ($1,600)
- Blue Ocean Challenge: Top 30 of 13,000+ teams
- DECA ICDC: Top 20 Finalist (Finance), 2x qualifier, 2x Texas State, 3x District
- Mott Million Dollar Challenge: Semifinalist top 60 of 5,300+, $5,250 awarded
- Stiftung Global Entrepreneurship: 2nd of 100 international startups
- Kean Challenge: 1st, $2,000
- Texas A&M Ideas Challenge: 2nd, $2,000
- Big Idea Competition: 1st, $1,000
- Diamond Challenge: Semifinalist twice (top 10% of 2,200 teams)
- SAT: 1550 (790 Math, 760 R&W)

Leadership:
- iStart Valley: President. 5,000+ members, 4+ national hackathons, podcast 1,000+ listeners/episode.
- DECA: VP, incoming Chapter President. 200+ members.
- BPA: Chapter VP, National Champion. 150+ member chapter.
- Keith Self Congressional Advisory Council: 1 of 5 selected from 70 to advocate in Washington D.C.

Experience:
- GradeWay: Growth Lead, May 2024–Present
- Young Chefs Academy: Lead Chef, Jan 2024–May 2025
- DiscoverSTEM: Executive Team Captain, patent-pending Termite Management System (USPTO App No. 19347695)

Contact: kvchiefs@gmail.com | github.com/kvdoe`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ reply: 'Chat is not configured yet.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const messages = (body.messages || []).slice(-10);

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ]
    })
  });

  if (!groqRes.ok) {
    const err = await groqRes.text();
    console.error('Groq error:', err);
    return new Response(JSON.stringify({ reply: 'Something went wrong on my end.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const data = await groqRes.json();
  const reply = data.choices?.[0]?.message?.content || 'No response.';

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}