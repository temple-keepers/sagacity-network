CREATE TABLE IF NOT EXISTS public.email_templates (
  band TEXT NOT NULL,
  email_number INT NOT NULL,
  subject TEXT NOT NULL,
  preview TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (band, email_number)
);

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Digitally At Risk', 1, 'Your Digital Assessment: {{score}}/100', 'You''re "Digitally At Risk" — here''s what that means and where to start', $body$Hi {{name}},

I've reviewed your assessment responses for {{business}}, and I want to be straight with you: your score is {{score}}/100, which puts you in our "Digitally At Risk" band. That's not a judgment — it's a diagnosis.

What "Digitally At Risk" means is this: you've got little or no web presence, no follow-up systems in place, basic or no cybersecurity, and a lot of manual admin eating up your time. For a business like yours, that's urgent. Not because I'm trying to scare you, but because every day you're losing enquiries, exposing yourself to security breaches, and working harder than you need to.

Your three biggest gaps are in web presence, client follow-up systems, and cybersecurity. Those are the places where one solid move would change your business immediately.

I've put together a short email sequence over the next week — just five emails, one every couple of days. Each one focuses on one thing: what's wrong, why it matters, what fixing it looks like, and what's possible. No pressure. No pitch. Just real talk about what I'd do if this was my business.

If you'd rather talk now than wait for the sequence, book a free 30-minute call here: https://sagacitynetwork.net/book?leadId={{lead_id}}

Looking forward to helping you turn this around.

Denise

P.S. Keep your assessment score somewhere you can see it. We'll come back to it in a few weeks and I reckon you'll want to.$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Digitally At Risk', 2, 'Why your invisible online — and what it''s actually costing', 'Web presence is where this starts. Here''s the real math.', $body$Hi {{name}},

You're "Digitally At Risk" partly because you don't have a real web presence. And I know what you're thinking: "Denise, I get enquiries through word of mouth. I don't need a website."

Here's the thing — you're right that word of mouth works. But it's also the only way enquiries can reach you. The moment someone your customer knows mentions you, if they can't find you online to verify you're real, they move on to the next name. Or they find your competitor's site and assume you're out of business.

I worked with a plumber recently who had the same mindset. No website, no online presence, just word of mouth. When I showed him his Google search results — literally nothing — he understood the cost immediately. Someone recommends you to a client. That client Googles your name to confirm you exist. Radio silence. Awkward. They book the other guy instead. This happens dozens of times a year, and you never even know it's happening.

A basic, properly optimised web presence doesn't have to be elaborate. It's a single page that tells people who you are, what you do, and how to reach you. It's answering the phone when someone Googles your business name and finds you. It's credibility. It's not optional anymore.

Fixing this actually looks like: a simple website with your story, your services, and a clear way for people to contact you. That's it. Not £5,000 and six months. Weeks. One time. Permanent.

Want us to take a look at this together? Book a free 30-minute call here: https://sagacitynetwork.net/book?leadId={{lead_id}}

Denise

P.S. Next email is about what's actually possible when this part gets fixed.$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Digitally At Risk', 3, 'What changed when they got online', 'A real story about visibility, enquiries, and six weeks', $body$Hi {{name}},

A bookkeeper came to us last year. Had been running her business for eight years, built it entirely on referrals, and was tired. Not of the work — of the ceiling it put on her growth. She had all the clients she could manage, but only because she'd personally met them. Online? Nothing. Website? No. When I asked her how many enquiries she was missing, she said: "I don't know. I don't hear about them."

We built her a simple website. Home page, about her, services, testimonials from existing clients, and a contact form. We set up Google Business Profile so when someone searches her name or "bookkeeper [her area]", she shows up. We put in some basic automation so enquiries got a response within an hour.

Six weeks later, she was getting enquiries from people she'd never met. People who'd Googled "bookkeeper near me" and found her. People who'd had her referred but wanted to check she was legit first. That first month alone, three new clients came in through the website. Small jobs, but real money. She hadn't spent weeks on it. The website was basic. But it worked because it was there.

Twelve months on, that basic website brings in about half her new work. The other half is still referrals. She's doubled her revenue, hired someone part-time, and cut her hours. Not because the website was fancy. Because it existed.

Your business is sitting on the same opportunity. People want to hire you. They just need to be able to find you first.

Book a call and tell us what you're working with: https://sagacitynetwork.net/book?leadId={{lead_id}}

Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Digitally At Risk', 4, 'The maths you''re not seeing', 'What you''re losing by staying invisible', $body$Hi {{name}},

Let me put some numbers to this. Right now, your website brings in zero enquiries. Zero. Because there's no website.

Say 500 people a month are looking for what you do in your area. They search Google, ask friends, look online. Some find competitors. Some move on. But some would find you if you existed online. Let's be conservative and say just 2% of those 500 monthly visitors actually convert to an enquiry. That's 10 potential clients a month you're not currently talking to.

10 clients a month is 120 clients a year. Not all will buy. Let's say 20% do, and the average job is worth £1,500. That's £36,000 in annual revenue sitting on the table right now. This year. Every year you wait.

That's what it's costing to stay invisible.

Now think about the cost of fixing it. A basic website, properly optimised, takes weeks and costs a fraction of one lost deal. And it stays there working for you. No subscription costs. No monthly retainers. It's a one-time fix that pays for itself in the first month.

The decision isn't really about whether you can afford a website. It's about whether you can afford not to have one.

Let's talk through your numbers. Book a free call: https://sagacitynetwork.net/book?leadId={{lead_id}}

Denise

P.S. One more email coming tomorrow. After that, it's your move.$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Digitally At Risk', 5, 'Let''s map out what''s possible', 'This is where we talk. No pitch, no pressure.', $body$Hi {{name}},

You've had a week now to sit with your assessment score. You know where you stand — and you know what it's costing you. So I'm going to ask directly: let's talk about fixing this.

I get it if you're hesitant. "Is this a sales pitch?" No. "Will you pressure me to buy something expensive?" No. "Will you try to dazzle me with jargon?" No. It's a 30-minute conversation. No pitch, no pressure. Just a clear picture of what's possible and what would make the biggest difference first.

Here's what happens on the call: You talk. We listen. We look at your three lowest-scoring categories together — your web presence, your follow-up systems, your cybersecurity. We tell you what we'd do if it were our business. We give you a straight answer about cost and timeline. You decide what, if anything, you want to do next. That's it.

Most people who take this call do want to move forward. Not because they felt pressured, but because they realised the cost of waiting is higher than the cost of fixing it. Some people decide to wait another month. Some decide it's not for them right now. Both are fine. My job is to give you the truth so you can make the right decision.

Book your free Digital Clarity Call here: https://sagacitynetwork.net/book?leadId={{lead_id}}

If a calendar booking feels too formal and you'd rather just reply and chat, do that instead. I read my emails.

Looking forward to talking.

Denise

P.S. You've got this. It's not as complicated as it feels.$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Early Stage', 1, 'Your Digital Clarity Score: {{score}}/100 (Early Stage)', 'You''re getting enquiries but losing them. We see exactly where.', $body$Hi {{name}},

Thanks for taking the time to work through our Digital Clarity assessment. I've run through your answers, and here's what we found.

Your score is {{score}} out of 100, which puts you in the Early Stage band. Here's what that means in plain terms: you've got some foundations in place—a website, maybe a social presence, the odd enquiry coming in. But things are inconsistent. You're getting interest from potential clients, but it's not converting like it should. You know something needs to shift, but you haven't started yet. That's fine. Most businesses are in this position at some point.

Your three biggest gaps right now are these:

Lead follow-up ({{q2}})—you're not responding fast enough or consistently enough to enquiries. That's costing you.

Automation ({{q4}})—you're doing too much manually when processes could run on their own. That's burning time.

Data and reporting ({{q5}})—you can't see what's actually working because you're not tracking it. That's killing your confidence to invest in marketing.

Here's what happens next. Over the next week, I'm sending you four more emails. Each one focuses on one of these gaps and shows you what's possible if you fix it. They're short. They're honest. They won't pitch you to death.

If you don't want to wait—if you'd rather just pick up the phone and talk through what you've found—you can book a free 30-minute call with me here: https://sagacitynetwork.net/book?leadId={{lead_id}}

Otherwise, I'll be in your inbox tomorrow with the first one.

All the best,
Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Early Stage', 2, 'Why you''re losing leads in the first hour', 'It''s not about luck. It''s about response time.', $body$Hi {{name}},

Remember your score yesterday? {{score}} out of 100, Early Stage band. I said your three biggest gaps were lead follow-up, automation, and data.

Today I want to talk about the first one, because it's the one that costs you the most right now.

Lead follow-up. You're not responding fast enough, or consistently enough, to the enquiries that come in. Here's what that means in real money: if you're getting 20 enquiries a month and you're only closing 10% of them, that's two clients a month. But if your follow-up is slow—if they don't hear back within an hour—they don't wait around. They call a competitor. The statistic is clear: every lead that doesn't hear back within 60 minutes is statistically more likely to go somewhere else.

So what does slow follow-up actually cost you? Let's say your average client is worth £5,000 in revenue. Right now you're losing the enquiries that slip through the cracks because nobody's following up. If you had a process—if someone responded within an hour, every time—you could easily double your conversion rate. That's ten clients a month instead of two. That's £100,000 a year in revenue that's already walking away.

What fixing it looks like: it's not complex. It's a system. An automated acknowledgement email that goes out the moment someone fills in your contact form. A reminder in someone's inbox to make a phone call within the hour. A log of who's called back. A checklist of what needs to happen next. That's it. Most businesses don't have this because they think it's hard. It's not. It's just consistent.

Want us to take a look at this together? I can spend 30 minutes on a call with you, you can show us what's happening now, and we'll tell you exactly what would change if you fixed this one thing.

Book a free call here: https://sagacitynetwork.net/book?leadId={{lead_id}}

All the best,
Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Early Stage', 3, 'How a marketing agency stopped losing leads', 'Coffee talk: what changed when they automated follow-up', $body$Hi {{name}},

I want to tell you about a business I worked with last year. Not to brag—just to show you what's possible.

They ran a small digital marketing agency. Three people. Good work. But they were watching leads evaporate. Someone would fill in their contact form at 10 AM. By the time anyone noticed and called back at 4 PM, the prospect had already got quotes from two other agencies. Sound familiar?

We had a conversation over coffee (well, a video call—pandemic habits die hard). They showed me their process. There wasn't one. Enquiries landed in email. If the right person was paying attention, they called back. If not, nobody did. Sometimes a lead would sit there for three days.

So we built them a system. When a form came in, an automated email went straight back saying "Thanks, we're looking at this now, you'll hear from us in the next hour." A Slack notification hit their team. A task appeared in their project tracker. And here's the thing: they added a rule. If an enquiry came in before 5 PM, it got a phone call that same day. If it came in after 5 PM, first thing next morning.

Three months later, their follow-up was happening within 30 minutes. Their close rate went from 8% to 17%. That's not a fluke. That's process.

They didn't spend money on fancy marketing tools. They didn't hire anyone. They just fixed the thing that was already broken.

Book a call and tell us what you're working with. We'll listen to what's happening now and show you what we'd do.

Here's the link: https://sagacitynetwork.net/book?leadId={{lead_id}}

All the best,
Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Early Stage', 4, 'The math that keeps me up at night', '(And why I think you should fix this before you spend another pound on marketing)', $body$Hi {{name}},

Quick math.

You're getting 20 enquiries a month. You're converting 10% of them. That's two clients a month.

Let's say each client is worth £5,000 to you. That's £10,000 a month. That's £120,000 a year on 20 enquiries.

Now here's the thing that keeps me up. You've got those 20 enquiries already coming in. You're not waiting to get better at marketing. The leads are there. But you're losing them because your follow-up is slow.

If you fixed just that one thing—if someone responded within the first hour, every single time—you'd statistically double your close rate. Not in a month. Not after spending more money on ads. Now. With the 20 enquiries you're already getting.

That would be four clients a month. That would be £20,000 a month. That would be £240,000 a year. On the same amount of enquiries.

The difference between those two numbers is not the cost of fixing your follow-up. The difference between those two numbers is what you're already spending by not fixing it.

That's what's costing you. Not a new tool. Not a new platform. The thing you could fix right now.

Let's talk through your numbers. I'll ask you a few questions about what's actually happening, and you'll see exactly how much better things could look with the right system in place.

Book a free call here: https://sagacitynetwork.net/book?leadId={{lead_id}}

All the best,
Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Early Stage', 5, 'A week of thinking. Now what?', 'You''re closer to fixing this than you think.', $body$Hi {{name}},

You've had this score in your inbox for a week now. You've read about your gaps—the follow-up, the automation, the data. You've thought about what's possible if you fix them.

I want you to know something. You're closer than you think.

I'm not saying that to sell you. I'm saying it because it's true. You've already got the enquiries coming in. You know what needs to shift. You just need someone to sit down with you and map out what that shift looks like—and then you get to decide what you actually want to do about it.

Here's what a call with me looks like. It's 30 minutes. No pitch, no pressure, no agenda I've decided for you. You talk. We listen. We look at your three lowest-scoring categories together. We tell you what we'd do if it were our business. You decide what, if anything, you want to do next. That's it.

Some people realise they can fix things themselves. Some people need a partner. Some people aren't ready yet—and that's fine. But either way, you know where you stand and what you'd need to do to move.

Book your free Digital Clarity Call here: https://sagacitynetwork.net/book?leadId={{lead_id}}

If you'd rather just reply to this email and suggest a time that works, do that. I'll find a slot.

All the best,
Denise

P.S. — I genuinely believe that clarity is the first step. You've already taken it by filling in the assessment. Now let's turn that clarity into a plan.$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Developing', 1, 'Your Digital Foundations Score: {{score}}/100', 'You''re in the Developing band. Here''s what''s holding you back.', $body$Hi {{name}},

Your assessment is done. You scored {{score}}/100, which puts you in the Developing band. That's honest feedback, and it's useful.

You've built real foundations. Your website works. You have some process in place. You understand the gaps. That's further ahead than many. But there are three areas where you're bleeding capability right now: automation, data and reporting, and AI readiness.

Here's what Developing means: you're not in crisis. Your business isn't broken. But you're still doing too much by hand. You're making decisions without the data you need. You're not yet using AI to move faster. The gap between where you are and where you could be is real, measurable, and fixable—but only if you act.

Over the next week, I'm going to walk you through what's possible. I'll show you what the gap is costing you. I'll tell you a real story about a business like yours that fixed it. And then I'll ask you to book a conversation with me so we can figure out which problem to solve first.

This isn't a sales funnel. It's how I work with people I want to help. You're one of those people.

Next email lands tomorrow. In the meantime, if you want to skip ahead and talk to me now, the calendar is here: https://sagacitynetwork.net/book?leadId={{lead_id}}

Talk soon,

Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Developing', 2, 'Why Your Manual Processes Are Costing You Real Money', 'The gap between Developing and Optimised comes down to one thing.', $body$Hi {{name}},

In your Developing band, the biggest leak isn't your website. It's not your security or your data. It's automation.

You're still doing things by hand that could run on their own. That might be invoice chasing. Lead follow-up. Data entry. Report generation. Client onboarding. Whatever it is, someone in your business is spending hours each week on work that a system could do in minutes.

Here's why it matters. Every hour you spend on a repeatable task is an hour you're not spending on the work that only you can do. That's either a revenue opportunity you're missing or a growth boundary you've hit. Both cost you money.

Let me be concrete. If you're spending five hours a week on administrative work that could be automated, that's 250 hours a year. At a conservative £30 per hour, that's £7,500 in lost capacity. More likely, it's higher. And that's just one person, one process. Most businesses have three or four of these leaks running simultaneously.

The fix isn't expensive. It's not complicated. It's usually a combination of tools you already subscribe to (like Zapier or Make), your existing software (spreadsheets can do far more than most people think), and sometimes a small piece of custom code. The payback comes fast. I've seen businesses reclaim twenty hours a week within a month.

I want to walk through this with you. Not to sell you anything. Just to show you what's possible and help you see the gap clearly.

Want us to take a look at this together? Book a free 30-minute call and let's find your biggest automation opportunity: https://sagacitynetwork.net/book?leadId={{lead_id}}

Talk soon,

Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Developing', 3, 'How {{business}} Could Save 8 Hours a Week (Real Story)', 'This is how a business like yours fixed its biggest leak.', $body$Hi {{name}},

I want to tell you a story. It's about a recruitment consultancy I worked with last year.

They'd been operating for eight years. They had a solid client base, good margins, and a team of four. But every Monday morning, one of them would spend three hours pulling candidate data from their ATS, cross-referencing it with their email archive, updating a spreadsheet, and then sending status reports to clients manually. Every Friday, they'd do it again to capture the week's placements. Wednesday afternoon involved another data pull for internal forecasting. That was eight hours a week—about 400 hours a year—spent shuffling the same data through different systems.

They came to me frustrated but resigned. They thought that's just what staffing looked like.

We spent 45 minutes mapping the workflow. Turned out their ATS had an API. Their CRM could connect to it. And their client portal had a webhook. We built a simple automation that pulled placement data from the ATS every Friday morning, updated their CRM, and pushed a pre-formatted report to each client's portal within minutes. No human intervention.

The result: the team member reclaimed eight hours a week. The clients got faster reporting. The internal forecast was updated in real time instead of every Wednesday. They reinvested those hours into business development—and within three months they'd landed two significant new contracts worth £200k.

The automation cost them £1,200 to build. It paid for itself in ten days.

Your business probably has something similar sitting right in front of you. A repeatable process that feels like it just has to be manual because that's how you've always done it. I'd like to help you find it.

Book a call and let's talk about what's possible: https://sagacitynetwork.net/book?leadId={{lead_id}}

Talk soon,

Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Developing', 4, 'The Cost of Waiting (Do This Math)', 'What you''re losing by not automating yet.', $body$Hi {{name}},

I want you to do a quick calculation.

Assume you're spending eight hours a week on tasks that could be automated. That's 400 hours a year. Now, what's your hourly rate—or what would you charge a client for your time? For most people in your position, it's somewhere between £25 and £50 per hour. Let's be conservative and say £30.

400 hours × £30 = £12,000 in lost capacity every year.

That's not the cost of automation. That's the cost of not automating. It's money you're already losing.

And it compounds. That £12,000 becomes £36,000 over three years. It's not sitting in a bank account waiting for you to spend it. It's already gone. You've already used that time on work that doesn't move your business forward.

Now, I could build an automation solution for you. Depending on complexity, you're looking at somewhere between £1,000 and £5,000. Let's say £3,000 as a realistic mid-point. That's a payback period of about three months.

After three months, you've reclaimed £3,000 in capacity that you can invest in growth. Over a year, it's twelve grand. Over five years, it's sixty thousand.

But here's the thing: most people don't act on this. They read the email, think "yeah, that makes sense," and then carry on doing things the same way. I see it all the time. The cost of inaction is always higher than the cost of fixing it—but inaction is still the default.

I don't want that to be you.

If this math resonates, book a call. We'll map out exactly where those eight hours are going and what it would take to reclaim them: https://sagacitynetwork.net/book?leadId={{lead_id}}

Talk soon,

Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Developing', 5, 'Let''s Look at Your Next Level', 'A week of thinking. Now let''s talk about what to do.', $body$Hi {{name}},

You've had a week to sit with your assessment. You've seen the gaps. You've read the stories. You know what the math looks like.

Now I want to be direct about something: you might be thinking "automation sounds great, but I'm worried it's going to be complicated" or "I don't have budget right now" or "I'm not sure where to start."

Those are all real concerns. And they're also all solvable.

Here's what happens on a call with me. We spend thirty minutes walking through your business. I ask you about the workflows that eat your time. I listen for patterns. Then I tell you honestly what I think could be automated, how long it would take, and what it would cost. If it doesn't make sense, I'll tell you that too. This isn't a sales call—it's a diagnostic conversation.

The calendar link is here: https://sagacitynetwork.net/book?leadId={{lead_id}}

You'll see my availability for the next two weeks. Pick a time that works. I'm in UK time, but I take calls across time zones.

If a calendar booking doesn't work for you, just reply to this email. Tell me what you're thinking. I read everything that comes back.

You've built something real. You've scored honestly on an assessment. You know there's a gap. The only question now is whether you're going to do something about it. I think you should.

Talk soon,

Denise

P.S. — I genuinely do read the replies. If you want to tell me what prompted you to take the assessment in the first place, or what problem is top of mind for you right now, I want to hear it. That context helps me understand your business better when we talk.$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Advanced', 1, '{{name}}, your assessment score: {{score}}/100 (Advanced)', 'You''re in the top tier. Here''s what that means and where to look next.', $body$Hi {{name}},

Your assessment is complete. Score: {{score}}/100. That puts you in the Advanced band.

What does Advanced mean? You've got strong fundamentals across web presence, client experience, and cybersecurity basics. You're not scrambling to fix broken things. Your real opportunity now is compounding — building systems and tooling that create structural advantage, so the more you run your business, the faster it gets. That's where the gap between you and competitors either closes or widens.

Your three strongest areas are {{q6}}, {{q2}}, and {{q7}}. Your three lowest-scoring categories are automation refinement, AI readiness, and data-driven reporting. These aren't crisis points. They're where you have the most room to move.

Here's what's coming. Over the next week, I'm sending you four more emails. The first goes deep on AI readiness and why it matters to someone like you, right now. The second shows a real example of what building this looks like. The third walks through the actual cost of not moving. The last is a straightforward invitation to talk.

No pressure on any of this. If nothing lands, that's fine. But if one conversation could surface something worth acting on, I'd rather you had the option.

You can book a free 30-minute call anytime: https://sagacitynetwork.net/book?leadId={{lead_id}}

Talk soon,
Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Advanced', 2, 'Why AI readiness is your biggest move right now', 'It''s not about being "cutting edge." It''s about compounding.', $body$Hi {{name}},

You're Advanced. That means you've already built something solid. You're not fixing foundational problems. Which is exactly why AI matters to you now.

Here's the thing. Most businesses are still asking "Should we use AI?" You're past that. The real question is: "Where do we embed AI into our operating system so it compounds over time?"

For someone at your level, that's usually automation that learns, reporting that runs without a human thinking through it, or workflows that get faster and more accurate the more data they process. Not flashy. Not "AI everything." Just systematically better.

Your assessment score for AI readiness was {{q8}}. That gap isn't a crisis — it's an opportunity. You've got the infrastructure, the client base, and the discipline to actually make this stick. What you're missing is clarity on where to start and how to build it without chaos.

Here's the real cost. Every month that a competitor at your level builds this in and you don't, they're compounding small advantages into structural edge. Three months from now, they're moving 10% faster. Six months, 25%. A year out, the gap looks like a different category of business.

The other thing: it's not as hard as you think. Most Advanced businesses get stuck in analysis. They know something should happen. They don't know what or how. One conversation can change that.

If you want to talk through where AI actually fits into {{business}}, I'm here. Free 30-minute call: https://sagacitynetwork.net/book?leadId={{lead_id}}

That's it for now.
Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Advanced', 3, 'What this actually looks like (real example)', 'A conversation over coffee. Here''s what I saw.', $body$Hi {{name}},

I want to show you what Advanced actually looks like in motion.

Last month I sat down with a business owner — similar to you, actually. Growing, solid systems, but running on legacy workflows. They told me their team was drowning in manual data processing. Every week, someone spent two days just moving numbers between spreadsheets and reporting platforms. It was slow. It was error-prone. And it kept them from thinking strategically.

We mapped out their workflow. Turns out, it was three distinct jobs: pull data from their CRM, transform it, push it to their analytics tool. Manual. Repetitive. The same logic every single time.

We built a custom AI workflow that sits between those systems. Takes 5 minutes now instead of 10 hours a week. More important, the data is cleaner because there's no human fatigue in the process. That one change freed up capacity. They used it to actually look at what the data was saying instead of just collecting it.

Six months later, they'd spotted two revenue leaks that were costing them about 8% of annual profit. They fixed them. The workflow paid for itself in the first quarter.

That's not magic. That's structure. That's what happens when you move from "I'm busy" to "I've got systems."

You might have three problems like that in {{business}} right now. You probably don't know about them because you're too deep in the day-to-day to see them. That's what I'm here for.

Want to walk through your workflows and see if there's something like this hiding in there? Book a call: https://sagacitynetwork.net/book?leadId={{lead_id}}

Talk soon,
Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Advanced', 4, 'The math on waiting (and it''s not linear)', 'Every month compounds. Here''s why that matters.', $body$Hi {{name}},

I want to be direct about something.

Right now, there's probably another Advanced business in your space who's thinking about exactly what you're thinking about. They're considering whether to build AI into their systems. Whether it's worth the effort. Whether the ROI is real.

One of you will do it. One of you won't.

Here's what happens next. In month one, the gap is barely visible. Maybe 5% difference in speed or efficiency. Not much. But that 5% is compounding. In month two, they're not 10% ahead. The math doesn't work that way. The gap compounds because their systems are getting smarter as they run. They're learning from more data. They're discovering optimizations that didn't exist before.

Month three: that gap looks like 15%. Month six: 30%. A year out, they're not 60% ahead. They're operating in a different category. Different speed, different margins, different capacity to invest in what comes next.

This isn't about playing catch-up later. You can always build this. The cost isn't the build. The cost is every month you don't, while someone else does. That's not linear. That's exponential.

For someone at your level, right now is the inflection point. Not because the technology is new. Because you've got the stability and discipline to actually make it stick. Most businesses don't. You do.

This week, decide. Not "should I do this?" but "do I start this month or next quarter?" One conversation can answer that.

Book a call: https://sagacitynetwork.net/book?leadId={{lead_id}}

Denise$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();

INSERT INTO public.email_templates (band, email_number, subject, preview, body) VALUES
('Advanced', 5, 'One conversation. No obligation.', 'Here''s what the call is actually for.', $body$Hi {{name}},

You've had a week to think about this. I'm not going to pretend the emails were subtle. I laid out what I see in your assessment, what's possible, and why timing matters.

You know your business better than anyone. You probably know whether there's something here worth exploring. So I'm not going to push. Instead, I'll tell you what actually happens if you book the call.

We spend 30 minutes together. I ask you about your team, your workflows, and where you're losing time or accuracy. You tell me what matters to you right now. We map one or two specific problems. By the end, you'll know exactly what I think could move the needle and what it would actually take to build it.

No sales pitch. No pretending you need something you don't. Just one straight conversation.

If it lands — if something we talk through is worth acting on — then we talk next steps. If it doesn't, you've still got clear thinking about what your options are. That's valuable either way.

You can book here: https://sagacitynetwork.net/book?leadId={{lead_id}}

If you'd rather just reply to this email and tell me what you're thinking, do that instead. I read my own inbox. Sometimes a conversation by email is clearer.

Either way, I'm here.

Denise
Sagacity Network

P.S. — I don't send these sequences to everyone who scores in the Advanced band. Most businesses aren't set up to actually move on something like this. You are. That's not small. That's worth listening to.$body$)
ON CONFLICT (band, email_number) DO UPDATE SET subject=EXCLUDED.subject, preview=EXCLUDED.preview, body=EXCLUDED.body, updated_at=now();
