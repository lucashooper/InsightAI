import { LocalStorageService } from '../services/localStorageService';

interface DiaryEntryFile {
  filename: string;
  title: string;
  content: string;
  date: Date;
  wellbeingScore?: number;
  resilienceScore?: number;
  insights?: Array<{
    insight: string;
    sentiment: 'positive' | 'opportunity';
    category: string;
  }>;
}

// Map of diary entries with their content
const diaryEntries: DiaryEntryFile[] = [
  {
    filename: 'entry-1-october-2025 (1).txt',
    title: '1st of October',
    content: `October 1, 2025 at 10:10 PM

Decent day, not the best Signal > Noise ratio. Lil bit of anxiety when I went out and was walking around, this kind of tightness in my chest etc, but on the walk back it was better, not terrible.

Got a lil bit of work done, but I had to wait to do the stripe integration, but Remelife should be finished tommorow.`,
    date: new Date('2025-10-01T22:10:00'),
    wellbeingScore: 6,
    resilienceScore: 6,
    insights: [
      { insight: 'You made progress on work despite waiting for dependencies', sentiment: 'positive', category: 'Work & Productivity' },
      { insight: 'Anxiety improved during the walk - physical activity helps', sentiment: 'positive', category: 'Mental Health' },
      { insight: 'Consider booking GP appointment for chest tightness symptoms', sentiment: 'opportunity', category: 'Health' }
    ]
  },
  {
    filename: 'entry-2-october-2025.txt',
    title: '2nd October',
    content: `October 2, 2025 at 3:28 PM

Woke up insanely tired, and after a while got a bit of a migraine. Im not sure why I woke up so tired. I probably went to be at around 2am, and then woke up at like 10. Actually it might of been 9, but still. Not that bad.

Still I was very tired and demotivated, I layed in bed for about an hour, until I decided I should go out and get some food and a monster energy. (Although I know, energy drinks do often make my anxiety worse etc and I was debating it). Anyway ill be honest, the walk there and back wasn't really pleasant at all. I felt a bit tired, the weather wasnt terrible, but it was decently bright so I had to wear sunglasses. Its still crazy to me how bright the world is for me even when its cloudy and its only very slightly sunny.

Anyway I had a bit of anxiety on the way there, not the worst ever, I think the sunglasses do help somewhat in that regard. But I was quite tired. ON the way back I decided to listen to some music, even though I know in general I decided that I should go against the herd and not listen to music much when I am walking around, as it fuels dissociation from the enviroment, its pure escapism and not a good solution or strategy to anxiety. But still I indulged for a lil bit on the walk back. It was alright.

Im back home but still feel tired, I seriously need to book a doctors appointment, my chest often just feels a bit strange, so does my throat and the  fatigue has been an ongoing thing for months.`,
    date: new Date('2025-10-02T15:28:00'),
    wellbeingScore: 4,
    resilienceScore: 5,
    insights: [
      { insight: 'You pushed yourself to go outside despite tiredness - showing resilience', sentiment: 'positive', category: 'Self-Care' },
      { insight: 'Awareness that energy drinks worsen anxiety - good self-knowledge', sentiment: 'positive', category: 'Mental Health' },
      { insight: 'Fatigue and physical symptoms need medical attention - book GP appointment', sentiment: 'opportunity', category: 'Health' },
      { insight: 'Late bedtime (2am) affecting energy - consider earlier sleep schedule', sentiment: 'opportunity', category: 'Sleep & Recovery' }
    ]
  },
  {
    filename: 'entry-3-october-2025.txt',
    title: '3rd October',
    content: `October 3, 2025 at 3:29 PM

Not great so far, woke up very tired, probably partially because I did go to bed a bit late and also because yesterday I had a monster probably a bit after 12, and as Bryan Johnson said, if you have caffeine after midday, some of it is going to stay in your system in the evening and make it harder to sleep / undermine sleep quality.

I probably shouldn't of had one today either, but I was just very tired. Now that we have a tea cup, tommorow either just have a tea or no caffeine at all. I shouldn't be reliant on it. If I feel insanely tired without it, and with it, something is wrong. I need to book some GP appointments. I think I can just do it now via the NHS app, but maybe its better to go in person so I can socially engineer them to get me an appointment sooner? Not sure. I guess I could always book on the NHS app, cancel if they give me an appointment ages away, and then try rebook in person.

Anyway, today I woke up tired, went for a walk to the Spar shop at about 1PM, it was a bit rainy and dreary, and I had a bit of a migraine, so naturally not the best walk in the world, that being said, on the walk there, when I had a little bit of anxiety I tried the deep breathing / anti anxiety methods, and they actually helped a bit in the moment and I recall feeling better. Which is good, I should definitely keep stuff like that up. However the walk back wasn't great, it was quite bad weather, I was pretty tired and I came back sweaty and feeling like I had just been on some Skyrim mission.

Evening : Got some decent work done, decent signal. Not bad at all, spoke to Tom quite a bit in the kitchen, he's chill and its good to practice my social skills. He was yapping quite a bit though. Might try go to bed early today.`,
    date: new Date('2025-10-03T15:29:00'),
    wellbeingScore: 5,
    resilienceScore: 6,
    insights: [
      { insight: 'Deep breathing methods helped reduce anxiety - effective coping strategy', sentiment: 'positive', category: 'Mental Health' },
      { insight: 'Social interaction with Tom - practicing social skills', sentiment: 'positive', category: 'Social Connection' },
      { insight: 'Got decent work done in the evening despite difficult morning', sentiment: 'positive', category: 'Work & Productivity' },
      { insight: 'Caffeine after midday affecting sleep quality - adjust timing', sentiment: 'opportunity', category: 'Sleep & Recovery' }
    ]
  },
  {
    filename: 'entry-5-october-2025.txt',
    title: '4th October Recap',
    content: `October 5, 2025 at 1:48 AM

Decent day, woke up late again, was very tired. But ended up doing a decent bit of work. Spoke to da bois in the evening. Listened to Pavel Durov on Lex Fridman for a bit, very interesting insights, ones I already knew, eg the importance of Signal > Noise focus, but still. He is a very cool dude.`,
    date: new Date('2025-10-05T01:48:00'),
    wellbeingScore: 6,
    resilienceScore: 6,
    insights: [
      { insight: 'Productive despite waking up tired - good work ethic', sentiment: 'positive', category: 'Work & Productivity' },
      { insight: 'Social connection with friends in the evening', sentiment: 'positive', category: 'Social Connection' },
      { insight: 'Learning from Pavel Durov reinforced Signal > Noise importance', sentiment: 'positive', category: 'Personal Growth' }
    ]
  },
  {
    filename: 'entry-24-september-2025.txt',
    title: '24th September - Night time',
    content: `September 24, 2025 at 11:21 PM

Haven't been locked in recently when I have been at home, gooning a bit too much, playing crossy road and getting distracted, biting my nails.

Recently, my bad habits and lack of focus kind of converged and culminated into a big blunder with the remelife project, for some reason, somehow the Wallet RCB started routing to the old RCB, lots of things started breaking, it all began when there were some Netlify deploy issues, which I believe had something to do with NextJS. Anyway, I could've saved myself a lot of time and annoyance if I was more organised and thorough and had forced myself to fix the git push stuff from before. We are nearly at the finish line for Luki now, everything looks quite good, the X is coming together, my Dad is getting reputable people to follow and affiliate themself with the project. The market is in a bit of a downturn now, but it should turn around soon, in October, thats generally how it works.

So the main point is, stay focused, don't fuck things up. I shouldn't need to lock in like crazy, tommorow I need to just ensure everything works again, make the codebase more clear, eg one NextJS project? Fix git deployment, better backup system, multi git branches (maybe) etc, and I am ofc going to hangout with my friends a bit while I am here, but I should try stay clearheaded and not let myself get too distracted.

When I think about Blui and Gramps, two projects with massive opportunity, there were several major key blunders I made. Blui was mainly not ensuring I got my own wallets / not a proper sell strategy, so I missed out on tens of thousands, possibly hundreds of thousands of profit ( we all did), and for Gramps, we overcomplicated the website, but most importantly, we didn't do a pumpfun fair launch and majorly fucked up by having loads and loads of insider wallets.

Some things are hard to predict, but I should indeed try and be as thorough as possible for Luki to ensure its sucess, ofc, it shouldn't, in theory be the end of the world if there are a few issues and bugs for the Remelife launch, thats expected for a lot of projects, but I need to be clear headed and in control, we all do. Especially since I will be across the world from my Brother and my Father. Anddddd I just gooned at night.. Debatable how bad it is at the end of the day though.`,
    date: new Date('2025-09-24T23:21:00'),
    wellbeingScore: 6,
    resilienceScore: 7,
    insights: [
      { insight: 'Strong self-reflection on past project mistakes (Blui, Gramps)', sentiment: 'positive', category: 'Personal Growth' },
      { insight: 'Learning to be more organized and thorough for future projects', sentiment: 'positive', category: 'Work & Productivity' },
      { insight: 'Need to maintain focus and reduce distractions (gooning, crossy road)', sentiment: 'opportunity', category: 'Focus & Discipline' },
      { insight: 'Awareness that bad habits affecting productivity', sentiment: 'opportunity', category: 'Behavioral Patterns' }
    ]
  },
  {
    filename: 'entry-25-september-2025.txt',
    title: '25th September - We locked in today',
    content: `September 25, 2025 at 11:58 AM`,
    date: new Date('2025-09-25T11:58:00'),
    wellbeingScore: 7,
    resilienceScore: 7,
    insights: [
      { insight: 'Committed to locking in and focusing - positive mindset', sentiment: 'positive', category: 'Focus & Discipline' }
    ]
  },
  {
    filename: 'entry-26-september-2025.txt',
    title: '26th September - Decent day',
    content: `September 26, 2025 at 11:29 PM

Decent day, was up really late watching tiktok because I helped my mum get to the airport, so woke up late.

Did mess up and go on tiktok / insta during the day etc, not good.`,
    date: new Date('2025-09-26T23:29:00'),
    wellbeingScore: 6,
    resilienceScore: 5,
    insights: [
      { insight: 'Self-awareness about social media usage affecting focus', sentiment: 'opportunity', category: 'Focus & Discipline' },
      { insight: 'Late night affected sleep schedule - adjust routine', sentiment: 'opportunity', category: 'Sleep & Recovery' }
    ]
  },
  {
    filename: 'entry-28-september-2025.txt',
    title: '27th Recap',
    content: `September 28, 2025 at 12:23 AM

Pretty good, 7/ 10.

Was fairly locked in, I did sleep in a bit, I woke up at 10 or something and then napped a bit longer and got out of bed at like 11:30 or something. Not sure if this is inherently bad, as I know that when I am tired during the day I am way less productive, but, that morning fatigue when you are in bed is kind of inevitable and maybe I should of just pushed through it.

anyway, woke up, for the most part, I stuck to the Signal over Noise routine, didn't really go on IG or tiktok, I did briefly go on tiktok, but for the most part I didn't. I can definitely feel my focus increase when I do this, so it is definitely something I should stick to.

Wake up, don't check notifications etc, maybe briefly look at my phone to see if anyone has called me, but no IG, no tiktok. In fact I can leave my phone on do not disturb, near the bed, away from the work station (eg where my laptop is) and then go on the laptop, few tabs open, no YT etc, just Lock in website, and the stuff I need to work on. And then a clear notepad list of what needs to be done. Thats the ideal schedule, and then periodically / after a few hours checking whatsapp in case something important is going on.

Today I got some decent work done, the git structure is looking much cleaner now. I definitely could of been quicker and more efficient, and I should sometimes, think more medium term about spending time creating better systems and structures so I can operate more efficiently. For example, I have been constantly running SQL commands manually, when apparently I can just install the Supabse CLI in Windsurf and the AI can run them for me, this would be much more efficient and save me time, in fact, lets do it now.`,
    date: new Date('2025-09-28T00:23:00'),
    wellbeingScore: 7,
    resilienceScore: 7,
    insights: [
      { insight: 'Stuck to Signal > Noise routine - reduced distractions', sentiment: 'positive', category: 'Focus & Discipline' },
      { insight: 'Improved git structure and codebase organization', sentiment: 'positive', category: 'Work & Productivity' },
      { insight: 'Thinking medium-term about systems and efficiency improvements', sentiment: 'positive', category: 'Personal Growth' },
      { insight: 'Morning fatigue pattern - consider pushing through vs resting', sentiment: 'opportunity', category: 'Sleep & Recovery' }
    ]
  },
  {
    filename: 'entry-29-september-2025 (1).txt',
    title: '28th Recap (Night)',
    content: `September 29, 2025 at 12:18 AM

Fairly good! Went to bed a bit late the night before, so I got up later, which I should try stop, I think I would definitely feel more productive and like I have more time in the day if I went to bed earlier and got up earlier.

That being said, decent Signal > Noise ratio throughout the day, didn't go on IG or tiktok until the evening, phone on DND, classic good routine stuff. Got most of the main stuff on the website done, had a fairly clear head and as a result had some cool (some obvious) ideas float up on how to improve ReMeLife. For example, having a seperate .app site which just hosts the app functionality and then an info site. Something we discussed before, but now feels more feasible and pragmatic than before.

Later in the evenining, I did feel a bit of a comedown, less motivation and focus, which is to be expected, I did goon a bit too much, but overall, pretty good. The evening is currently my weak spot, because I do often go to bed late, but not do productive things in those late hours.

Tommorow imma hang out with the boys for the last time before Uni, so should be fun.

Other things to mention, yh the night before when I was trying to fall asleep I had bad thoughts whirling around my head, classic stuff, and bad imagery. It is a problem I had a lot at uni. I noticed that I didn't really have symptoms like that as much when me and Mum were sleeping in the same bed recently. So its probably largely a primitive loneliness response.

Also I should probably bring my laptop to Evan's house just to keep a finger on the pulse while im there.`,
    date: new Date('2025-09-29T00:18:00'),
    wellbeingScore: 7,
    resilienceScore: 7,
    insights: [
      { insight: 'Good Signal > Noise ratio maintained throughout day', sentiment: 'positive', category: 'Focus & Discipline' },
      { insight: 'Creative ideas emerged with clear head - ReMeLife improvements', sentiment: 'positive', category: 'Work & Productivity' },
      { insight: 'Recognition of evening as weak spot for productivity', sentiment: 'opportunity', category: 'Time Management' },
      { insight: 'Intrusive thoughts at night - related to loneliness, consider support', sentiment: 'opportunity', category: 'Mental Health' }
    ]
  },
  {
    filename: 'entry-29-september-2025.txt',
    title: '29th September - Dope day',
    content: `September 29, 2025 at 10:18 PM

Hung out with the boys today, went to jars crib, we did the Chained together LAN party there briefly, was dope. I did wish I planned better in advance more though, for example, I was thinking about taking my laptop and mouse to jars house, just in case I want to do work there etc and for other possible reasons, but I didn't.

When I got there, it turns out, as I could've predicted, Beans did indeed want to be part of the LAN party, and not just sit and watch, but jars MAC didn't work, and Beans couldn't install the game because of those admin restrictions. The point being, I could of somewhat predicted this actually, and brought a laptop just in case. I should try plan ahead more, have backup plans, especially if they don't inconvenience me much.

Anyway, we then shifted to Beans (wills) house, we played Chained together there, all five of us, swapping 1 player in and out. It was hilarious, very fun. And then when Kooch and Jar left I sort of acted as a movie director for London and Beans, because London had a cool idea for a shot he wanted to do. The key theme was "everyone is trying to sell you something" so we were filming Beans as a salesman, in a suit, running up to London trying to sell him all kinds of items in the ambient, nice garden. The little dangling stone fish in the green branches was a bonus. Me and Beans were having fun kicking it.

And then Beans made me and London tea, and me and London made ramen, was dope. 

The bad part of the day: jar made a comment about 7harriet and her preferences, and I had some weird fantasies later in the day, gooned too much. In the evening, this made me think about a couple things and reinforced some preexisting views of mine. Firstly, porn is indeed very dangerous and corrupts your mind, its good that I am mostly tapering off it, I don't watch proper porn (fucking) and I rarely look at pornographic images. Nonetheless, it is still bad if I can't control my mind and have weird fantasies. I was thinking about this, and it made me think about my anxiety. As we know, my anxiety was at its peak, when I went into a positive feedback loop, where a negative thought, eg ( I am losing my mind > led to more anxiety > which led to more feelings of derealistion when I went outside, which in turn led to more anxiety which then led to negative thoughts etc. And as we know, it spiralled seriously out of control. The point being, if I can train my mind to have more self control over my thoughts, impulses etc. I am sure I will better be able to regulate anxious thoughts, and as a result these vicious feedback loops. Which we have been doing well on, I will give myself some credit. I haven't had a fullblown panic attack in a while. I'll admit, I still find myself "feeling strange" when I go outside, passively murmuring in my head often or feeling convinced that I am seeing the world in a different way post psychs than I did before. But overall, I am doing much much better. Which is awesome. But I have lengths to go.`,
    date: new Date('2025-09-29T22:18:00'),
    wellbeingScore: 7,
    resilienceScore: 8,
    insights: [
      { insight: 'Great social day with friends - LAN party and creative filmmaking', sentiment: 'positive', category: 'Social Connection' },
      { insight: 'Haven\'t had fullblown panic attack in a while - major progress', sentiment: 'positive', category: 'Mental Health' },
      { insight: 'Deep self-reflection on mind control and anxiety feedback loops', sentiment: 'positive', category: 'Personal Growth' },
      { insight: 'Planning ahead could improve outcomes - bring equipment just in case', sentiment: 'opportunity', category: 'Planning & Organization' },
      { insight: 'Working on reducing porn/gooning - connect mind control to anxiety management', sentiment: 'opportunity', category: 'Self-Control' }
    ]
  },
  {
    filename: 'entry-30-september-2025.txt',
    title: '30th September - First day of uni!',
    content: `September 30, 2025 at 7:13 PM

Was pretty good for the most part.

On the train I was pretty locked in, didn't listen to too much music and was reading the AI engineering book taking notes. Spoke with an old woman and the taxi driver when I got off.

Then a girl helped me out when I got to uni, wasn't sure if she was tryna rizz, but I gooned.

I did have a bit of derealisation, weird felling.

But for the most part, pretty good! I was optimistc, had fun in my room, Signal over Noise ratio wasnt amazing today, but still.

Had very bad anxiety late at night though, I suddenly had the thought in my head of what if I was locked in my room, and it freaked me out for a bit which wasn't good.`,
    date: new Date('2025-09-30T19:13:00'),
    wellbeingScore: 6,
    resilienceScore: 7,
    insights: [
      { insight: 'Locked in on train - reading AI engineering book productively', sentiment: 'positive', category: 'Personal Growth' },
      { insight: 'Optimistic mindset about first day at uni', sentiment: 'positive', category: 'Emotional Well-being' },
      { insight: 'Social interactions - talked with old woman and taxi driver', sentiment: 'positive', category: 'Social Connection' },
      { insight: 'Late night anxiety spike - intrusive thoughts about being locked in', sentiment: 'opportunity', category: 'Mental Health' },
      { insight: 'Some derealisation feelings - monitor and use coping strategies', sentiment: 'opportunity', category: 'Mental Health' }
    ]
  }
];

export async function importDiaryEntries() {
  console.log('🚀 Starting diary entries import...');
  
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const entry of diaryEntries) {
    try {
      console.log(`📝 Importing: ${entry.title}`);
      
      // Create the note with the original date using LocalStorageService
      const createdNote = await LocalStorageService.createNote(entry.title, entry.content);
      
      // Update the created_at timestamp to match the original date
      await LocalStorageService.updateNote(createdNote.id, {
        created_at: entry.date.toISOString(),
        updated_at: entry.date.toISOString()
      });
      
      // Add AI insights if provided
      if (entry.insights && entry.wellbeingScore && entry.resilienceScore) {
        const aiInsights = {
          wellbeingScore: entry.wellbeingScore,
          resilienceScore: entry.resilienceScore,
          insights_report: {
            conversationalSummary: `Entry from ${entry.date.toLocaleDateString()}`,
            keyTakeaways: entry.insights,
            actionableSuggestion: {
              title: 'Continue your progress',
              suggestion: 'Keep tracking your patterns and insights'
            }
          }
        };
        
        await LocalStorageService.saveAIInsights(createdNote.id, aiInsights);
        
        // Mark as analyzed
        await LocalStorageService.updateNote(createdNote.id, {
          isAnalyzed: true,
          analysisSummary: {
            positiveCount: entry.insights.filter(i => i.sentiment === 'positive').length,
            opportunityCount: entry.insights.filter(i => i.sentiment === 'opportunity').length,
            totalInsights: entry.insights.length
          }
        });
        
        console.log(`✅ AI insights added to: ${entry.title}`);
      }
      
      successCount++;
      console.log(`✅ Successfully imported: ${entry.title}`);
    } catch (error) {
      errorCount++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorLog = `Failed to import ${entry.title}: ${errorMessage}`;
      console.error(`❌ ${errorLog}`);
      errors.push(errorLog);
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount} entries`);
  console.log(`❌ Failed: ${errorCount} entries`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log(`  - ${error}`));
  }

  return {
    success: successCount,
    failed: errorCount,
    errors
  };
}
