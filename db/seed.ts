import { db } from "./index";
import * as schema from "@shared/schema";
import { encryptData } from "../server/encryption";

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Check if there are any posts
    const existingPosts = await db.query.posts.findMany({
      limit: 1,
    });

    if (existingPosts.length > 0) {
      console.log("Database already has posts. Skipping seeding.");
      return;
    }

    // Create a default admin user
    const adminExists = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin"),
    });

    let adminId = 0;

    if (!adminExists) {
      // Hash would normally be done in auth.ts, but for seeding we'll use a simple representation
      const defaultPassword = "$2a$10$randomHashedPasswordExample.salt";
      
      const [admin] = await db.insert(schema.users)
        .values({
          username: "admin",
          password: defaultPassword,
          role: "admin",
          createdAt: new Date(),
        })
        .returning();
      
      adminId = admin.id;
      console.log(`Created admin user with ID: ${adminId}`);
    } else {
      adminId = adminExists.id;
    }

    // Create some sample encrypted posts
    const posts = [
      {
        title: "10 Productivity Tips for Working from Home",
        content: encryptData(`
          <p>Working from home can be both a blessing and a challenge. Here are some proven strategies to help you stay focused and productive:</p>
          
          <h3>1. Create a dedicated workspace</h3>
          <p>Having a specific area for work helps your brain associate that space with productivity. Try to choose a quiet corner with minimal distractions.</p>
          
          <h3>2. Stick to a routine</h3>
          <p>Start and end your workday at consistent times. This helps maintain work-life balance and signals to your brain when it's time to focus.</p>
          
          <h3>3. Take regular breaks</h3>
          <p>The Pomodoro Technique (25 minutes of work followed by a 5-minute break) can help maintain focus and prevent burnout.</p>
          
          <h3>4. Set clear boundaries</h3>
          <p>Let family members or roommates know your working hours to minimize interruptions.</p>
          
          <h3>5. Dress for success</h3>
          <p>While pajamas are comfortable, changing into work clothes can psychologically prepare you for the workday.</p>
          
          <h3>6. Plan your day the night before</h3>
          <p>Spending 10 minutes each evening to plan the next day can save you hours of unfocused time.</p>
          
          <h3>7. Use time-blocking</h3>
          <p>Allocate specific time blocks for different tasks and try to stick to this schedule.</p>
          
          <h3>8. Minimize digital distractions</h3>
          <p>Turn off non-essential notifications and consider using apps that block social media during work hours.</p>
          
          <h3>9. Move your body</h3>
          <p>Regular movement improves focus and energy. Consider a standing desk or taking short walking breaks.</p>
          
          <h3>10. End the day with reflection</h3>
          <p>Take a few minutes to review what you accomplished and what needs to be carried over to tomorrow.</p>
          
          <p>Remember that finding your optimal work-from-home rhythm may take time. Be patient with yourself and adjust these strategies to fit your unique circumstances.</p>
        `),
        summary: encryptData("Discover the most effective strategies to stay focused and productive while working remotely..."),
        imageUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Productivity",
        tags: ["productivity", "remote-work", "work-life-balance"],
        authorId: adminId,
        author: "admin",
        featured: true,
      },
      {
        title: "The Art of Mindful Eating: A Beginner's Guide",
        content: encryptData(`
          <p>In our fast-paced world, meals are often rushed and mindless. Mindful eating offers a different approach, one that can transform your relationship with food and improve your overall wellbeing.</p>
          
          <h3>What is Mindful Eating?</h3>
          <p>Mindful eating is the practice of paying full attention to the experience of eating and drinking, both inside and outside the body. It involves using all your senses to experience food more intensely.</p>
          
          <h3>The Benefits of Mindful Eating</h3>
          <ul>
            <li>Better digestion and nutrient absorption</li>
            <li>Greater satisfaction from smaller portions</li>
            <li>Reduced overeating and emotional eating</li>
            <li>Increased enjoyment of food</li>
            <li>More awareness of hunger and fullness cues</li>
          </ul>
          
          <h3>How to Practice Mindful Eating</h3>
          
          <h4>1. Begin with a moment of gratitude</h4>
          <p>Before eating, take a moment to appreciate where your food came from and the effort that went into bringing it to your table.</p>
          
          <h4>2. Engage all your senses</h4>
          <p>Notice the colors, shapes, and textures of your food. Inhale the aromas. Listen to the sounds as you prepare and eat your food.</p>
          
          <h4>3. Eat slowly and chew thoroughly</h4>
          <p>Try to chew each bite 20-30 times. This not only aids digestion but allows you to fully experience the flavors.</p>
          
          <h4>4. Eliminate distractions</h4>
          <p>Turn off screens and put away books or work materials. When eating becomes a secondary activity, we tend to miss the eating experience.</p>
          
          <h4>5. Check in with your hunger</h4>
          <p>Throughout the meal, pause and check in with your body. Are you still hungry? Are you satisfied? Are you eating for emotional reasons?</p>
          
          <h3>A Simple Mindful Eating Exercise</h3>
          <p>Try this exercise with a raisin or small piece of chocolate:</p>
          <ol>
            <li>Hold the food item in your palm and examine it as if you've never seen it before</li>
            <li>Notice its weight, texture, color, and shape</li>
            <li>Smell the food, noting any sensations or memories that arise</li>
            <li>Slowly place it in your mouth without chewing</li>
            <li>Notice the sensations as it rests on your tongue</li>
            <li>Begin chewing very slowly, noting the flavors and textures</li>
            <li>Swallow with full awareness of the process</li>
          </ol>
          
          <p>Mindful eating isn't about perfect eating or strict rules. It's about developing a healthier, more conscious relationship with food. Start small, perhaps with just one mindful meal per week, and gradually build from there.</p>
        `),
        summary: encryptData("Learn how to transform your relationship with food through the practice of mindful eating..."),
        imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Wellness",
        tags: ["wellness", "mindfulness", "nutrition", "healthy-habits"],
        authorId: adminId,
        author: "admin",
        featured: true,
      },
      {
        title: "5 Life-Changing Books You Need to Read This Year",
        content: encryptData(`
          <p>Books have the remarkable ability to shift our perspectives, inspire personal growth, and sometimes completely change the trajectory of our lives. Here are five transformative books that deserve a place on your reading list this year:</p>
          
          <h3>1. "Atomic Habits" by James Clear</h3>
          <p><strong>Why it's life-changing:</strong> This book breaks down the science of habit formation into practical, actionable strategies. Clear explains how tiny changes can lead to remarkable results over time.</p>
          
          <p><strong>Key takeaway:</strong> "You do not rise to the level of your goals. You fall to the level of your systems." Creating effective systems, rather than focusing solely on goals, is the key to lasting change.</p>
          
          <h3>2. "Man's Search for Meaning" by Viktor E. Frankl</h3>
          <p><strong>Why it's life-changing:</strong> Written by a psychiatrist and Holocaust survivor, this profound book explores how finding meaning in our experiences—even the most painful ones—is essential to human existence.</p>
          
          <p><strong>Key takeaway:</strong> "Everything can be taken from a man but one thing: the last of the human freedoms—to choose one's attitude in any given set of circumstances."</p>
          
          <h3>3. "Mindset: The New Psychology of Success" by Carol S. Dweck</h3>
          <p><strong>Why it's life-changing:</strong> Dweck's research on fixed versus growth mindsets reveals how our beliefs about our abilities dramatically impact our success and happiness.</p>
          
          <p><strong>Key takeaway:</strong> Adopting a growth mindset—the belief that abilities can be developed through dedication and hard work—creates a love of learning and resilience essential for achievement.</p>
          
          <h3>4. "Digital Minimalism" by Cal Newport</h3>
          <p><strong>Why it's life-changing:</strong> In our hyper-connected world, Newport offers a philosophy for using technology intentionally rather than letting it control our attention and time.</p>
          
          <p><strong>Key takeaway:</strong> "Digital minimalism is a philosophy that helps you question what digital communication tools (and behaviors surrounding these tools) actually add value to your life."</p>
          
          <h3>5. "The Body Keeps the Score" by Bessel van der Kolk</h3>
          <p><strong>Why it's life-changing:</strong> This groundbreaking book explores how trauma affects both mind and body, offering new insights for healing and reclaiming your life.</p>
          
          <p><strong>Key takeaway:</strong> Understanding the physical manifestations of trauma can open new pathways to healing that go beyond traditional talk therapy.</p>
          
          <h3>Reading as a Transformative Practice</h3>
          <p>To get the most from these or any books, consider adopting these practices:</p>
          
          <ul>
            <li>Read with a pen in hand, marking passages that resonate</li>
            <li>Keep a reading journal to reflect on key insights</li>
            <li>Try to teach the main concepts to someone else</li>
            <li>Implement at least one idea from each book</li>
          </ul>
          
          <p>Remember that transformation doesn't happen through passive consumption. The true value of these books lies in how you integrate their wisdom into your daily life.</p>
        `),
        summary: encryptData("Explore these transformative books that have the power to shift your perspective and inspire growth..."),
        imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "Books",
        tags: ["books", "self-improvement", "personal-growth", "reading"],
        authorId: adminId,
        author: "admin",
        featured: true,
      },
      {
        title: "How to Build a Morning Routine That Sets You Up for Success",
        content: encryptData(`
          <p>The way you start your morning can set the tone for your entire day. A thoughtful morning routine can boost your productivity, improve your mental health, and help you approach each day with intention and purpose.</p>
          
          <h3>Why Morning Routines Matter</h3>
          <p>The first hours of the day offer a unique opportunity. Your willpower is typically strongest, your mind is clearer, and the world around you is often quieter, allowing for focused attention on what matters most to you.</p>
          
          <h3>Building Your Ideal Morning Routine</h3>
          
          <h4>1. Start the night before</h4>
          <p>A successful morning routine actually begins the evening before. Set out your clothes, prepare your breakfast, and make a short list of your most important tasks for the next day. This reduces decision fatigue in the morning and ensures a smoother start.</p>
          
          <h4>2. Wake up at a consistent time</h4>
          <p>Your body thrives on routine. Try to wake up at the same time each day—even on weekends if possible. This helps regulate your circadian rhythm and improves sleep quality over time.</p>
          
          <h4>3. Don't reach for your phone</h4>
          <p>When you immediately check email or social media, you're letting other people's priorities dictate your focus. Instead, give yourself at least 30-60 minutes of phone-free time to set your own intentions.</p>
          
          <h4>4. Hydrate</h4>
          <p>After 7-8 hours without water, your body needs hydration. Drinking a large glass of water (perhaps with lemon) helps wake up your digestive system and rehydrates your body.</p>
          
          <h4>5. Move your body</h4>
          <p>Morning movement doesn't need to be intense. A gentle yoga flow, a brisk walk, or even simple stretching can activate your muscles, increase blood flow, and release mood-enhancing endorphins.</p>
          
          <h4>6. Practice mindfulness</h4>
          <p>Even 5-10 minutes of meditation, deep breathing, or journaling can center your mind and reduce stress levels. This practice creates a buffer between you and your reactions, helping you respond more thoughtfully throughout the day.</p>
          
          <h4>7. Fuel your body properly</h4>
          <p>A balanced breakfast with protein, healthy fats, and complex carbohydrates provides sustained energy and stabilizes blood sugar levels.</p>
          
          <h4>8. Set daily intentions</h4>
          <p>Take a moment to identify your top 1-3 priorities for the day. What would make today successful? What deserves your best energy?</p>
          
          <h3>Sample Morning Routines</h3>
          
          <h4>The Minimalist (30 minutes)</h4>
          <ul>
            <li>5 minutes: Hydrate and gentle stretching</li>
            <li>10 minutes: Shower and dress</li>
            <li>10 minutes: Simple breakfast</li>
            <li>5 minutes: Review daily priorities</li>
          </ul>
          
          <h4>The Wellness Focused (60 minutes)</h4>
          <ul>
            <li>5 minutes: Hydrate and take supplements</li>
            <li>20 minutes: Yoga or light exercise</li>
            <li>10 minutes: Meditation</li>
            <li>20 minutes: Prepare and eat a nutritious breakfast</li>
            <li>5 minutes: Set intentions for the day</li>
          </ul>
          
          <h4>The Achievement Oriented (90 minutes)</h4>
          <ul>
            <li>5 minutes: Hydrate</li>
            <li>30 minutes: Exercise session</li>
            <li>10 minutes: Cold shower</li>
            <li>15 minutes: Journaling and gratitude practice</li>
            <li>15 minutes: Breakfast while reviewing goals</li>
            <li>15 minutes: Work on most important task of the day</li>
          </ul>
          
          <h3>Tips for Establishing Your Routine</h3>
          
          <p><strong>Start small:</strong> Begin with just one or two new habits rather than trying to overhaul your entire morning.</p>
          
          <p><strong>Be realistic:</strong> Design a routine that fits your life circumstances, not an idealized version from social media.</p>
          
          <p><strong>Focus on consistency over perfection:</strong> It's better to have a simple routine you follow daily than an elaborate one you rarely complete.</p>
          
          <p><strong>Adjust as needed:</strong> Your routine should evolve as your life circumstances change. What works during one season of life may not work in another.</p>
          
          <p>Remember that the ultimate purpose of a morning routine isn't to check boxes on a list but to set yourself up mentally, physically, and emotionally for a fulfilling day ahead.</p>
        `),
        summary: encryptData("Start your day with intention and purpose. In this post, we explore how to create a morning routine that energizes you and prepares your mind for a productive day..."),
        imageUrl: "https://images.unsplash.com/photo-1541199249251-f713e6145474?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "Lifestyle",
        tags: ["lifestyle", "productivity", "wellness", "habits"],
        authorId: adminId,
        author: "admin",
      },
      {
        title: "3 Simple Mindfulness Practices for Busy People",
        content: encryptData(`
          <p>Mindfulness doesn't require hours of meditation or a retreat in the mountains. Even with a packed schedule, you can incorporate simple practices that bring you back to the present moment, reduce stress, and increase your focus.</p>
          
          <h3>What is Mindfulness?</h3>
          <p>At its core, mindfulness is the practice of paying attention to the present moment with openness, curiosity, and without judgment. It's about being fully present with whatever you're experiencing, rather than dwelling on the past or worrying about the future.</p>
          
          <h3>Why Mindfulness Matters for Busy People</h3>
          <p>When we're constantly rushing from one task to the next, our minds become scattered and stressed. This affects our:</p>
          
          <ul>
            <li>Decision-making ability</li>
            <li>Creativity and problem-solving</li>
            <li>Relationships with others</li>
            <li>Physical health and immune function</li>
            <li>Overall sense of wellbeing</li>
          </ul>
          
          <p>The good news is that even brief moments of mindfulness can interrupt the stress cycle and bring us back to center.</p>
          
          <h3>Three Simple Mindfulness Practices</h3>
          
          <h4>1. The 3-Minute Breathing Space</h4>
          
          <p>This practice can be done anywhere—at your desk, in a meeting, or even in your car before entering a stressful situation.</p>
          
          <p><strong>Step 1: Awareness (1 minute)</strong><br>
          Pause and notice what's happening in your experience right now. What thoughts are present? What emotions do you feel? What sensations are in your body? Don't try to change anything—simply observe.</p>
          
          <p><strong>Step 2: Gathering Attention (1 minute)</strong><br>
          Gently direct your full attention to your breathing. Feel the sensations of the breath entering and leaving your body. When your mind wanders (and it will), simply notice that and bring your attention back to your breath.</p>
          
          <p><strong>Step 3: Expanding Awareness (1 minute)</strong><br>
          Widen your attention to include your whole body, your posture, and your facial expression. Notice any areas of tension and see if you can soften them with your breath.</p>
          
          <h4>2. Mindful Transitions</h4>
          
          <p>We transition between activities dozens of times throughout the day—from home to work, between meetings, from work to lunch, etc. These transitions offer perfect opportunities to practice mindfulness.</p>
          
          <p><strong>How to practice:</strong></p>
          <ul>
            <li>As you finish one activity before starting the next, take three conscious breaths</li>
            <li>Notice the physical sensation of moving from one space to another</li>
            <li>Set a clear intention for your next activity</li>
          </ul>
          
          <p>For example, after finishing a meeting and before checking your email, you might pause, take three breaths, feel your feet on the ground as you walk back to your desk, and set an intention to respond to emails with focus and clarity.</p>
          
          <h4>3. STOP Practice</h4>
          
          <p>When you notice yourself feeling overwhelmed, use the STOP acronym:</p>
          
          <p><strong>S - Stop</strong> whatever you're doing for a moment</p>
          <p><strong>T - Take</strong> a breath</p>
          <p><strong>O - Observe</strong> what's happening in your thoughts, emotions, and body</p>
          <p><strong>P - Proceed</strong> with awareness and intention</p>
          
          <p>This quick practice can interrupt automatic reactions and create space for more skillful responses.</p>
          
          <h3>Integrating These Practices Into Your Day</h3>
          
          <p>Consider linking these mindfulness practices to existing habits:</p>
          
          <ul>
            <li>Practice the breathing space before checking email in the morning</li>
            <li>Use mindful transitions when moving between meetings or tasks</li>
            <li>Try the STOP practice when your phone rings or notifications appear</li>
          </ul>
          
          <p>Start with just one practice and one trigger. Once it becomes familiar, you can expand to include others.</p>
          
          <h3>Remember: Quality Over Quantity</h3>
          
          <p>A few moments of true presence are more valuable than longer periods of distracted "meditation." These brief practices, done consistently and with sincere attention, can gradually transform your relationship with stress and bring more clarity and calm to even the busiest days.</p>
        `),
        summary: encryptData("You don't need hours of meditation to be mindful. Discover these three quick practices that you can incorporate into your busy schedule to reduce stress and increase focus..."),
        imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "Mindfulness",
        tags: ["mindfulness", "stress-management", "meditation", "mental-health"],
        authorId: adminId,
        author: "admin",
      },
      {
        title: "20 Thought-Provoking Journal Prompts for Self-Discovery",
        content: encryptData(`
          <p>Journaling is one of the most powerful tools for self-reflection and personal growth. It allows us to explore our inner landscape, discover patterns in our thinking, and gain insights that might otherwise remain hidden. The following journal prompts are designed to help you dig deeper into your values, goals, and personal journey.</p>
          
          <h3>Identity and Values</h3>
          
          <ol>
            <li><strong>What three words would you like people to use when describing you? Are you living in alignment with these qualities?</strong><br>
            This prompt helps clarify your core values and whether your actions reflect them.</li>
            
            <li><strong>What masks do you wear in different situations? When do you feel most authentically yourself?</strong><br>
            Explore the different personas you might adopt and what that reveals about your true self.</li>
            
            <li><strong>What beliefs did you inherit from your family or culture that you've questioned or rejected?</strong><br>
            Examine how your upbringing has shaped you and where you've chosen different paths.</li>
            
            <li><strong>What would you do with your life if you knew you couldn't fail?</strong><br>
            Uncover dreams and aspirations that fear might be holding back.</li>
          </ol>
          
          <h3>Patterns and Personal Growth</h3>
          
          <ol start="5">
            <li><strong>What patterns keep repeating in your life? What might they be trying to teach you?</strong><br>
            Identify recurring themes that might indicate unresolved issues or important lessons.</li>
            
            <li><strong>Describe a recent conflict. What triggered you, and what does that reveal about your values or wounds?</strong><br>
            Use disagreements as windows into what matters most to you.</li>
            
            <li><strong>What area of your life feels most out of balance right now? What small step could you take to restore harmony?</strong><br>
            Identify practical actions for addressing current challenges.</li>
            
            <li><strong>What are you currently learning about yourself? How is this knowledge changing you?</strong><br>
            Reflect on your active growth edges and how awareness is transforming you.</li>
          </ol>
          
          <h3>Relationships and Connection</h3>
          
          <ol start="9">
            <li><strong>Who in your life brings out the best in you, and why? What qualities in them or your relationship enable this?</strong><br>
            Examine the environments and relationships where you thrive.</li>
            
            <li><strong>What do you need more of in your relationships? How could you communicate this need?</strong><br>
            Clarify relationship needs and how you might fulfill them.</li>
            
            <li><strong>When was the last time you felt truly understood by someone? What made that experience meaningful?</strong><br>
            Explore what genuine connection feels like for you.</li>
            
            <li><strong>What parts of yourself do you find hardest to love? How might you show more compassion to these aspects?</strong><br>
            Practice self-compassion toward the parts of yourself you struggle to accept.</li>
          </ol>
          
          <h3>Purpose and Meaning</h3>
          
          <ol start="13">
            <li><strong>What activities make you lose track of time? What does this reveal about your passions?</strong><br>
            Identify experiences of flow as clues to your natural interests and talents.</li>
            
            <li><strong>What contribution would you like to make to the world, however small or large?</strong><br>
            Reflect on how you want to impact others and leave your mark.</li>
            
            <li><strong>When do you feel most alive? How could you create more of these moments in your life?</strong><br>
            Identify what brings you vitality and how to prioritize these experiences.</li>
            
            <li><strong>What would you regret not doing or becoming if your life ended tomorrow?</strong><br>
            Use this perspective to clarify what truly matters to you.</li>
          </ol>
          
          <h3>Gratitude and Joy</h3>
          
          <ol start="17">
            <li><strong>What are five small joys that reliably lift your mood? How could you incorporate more of these into your daily life?</strong><br>
            Identify simple pleasures that contribute to your wellbeing.</li>
            
            <li><strong>What challenges have you faced that you're now grateful for? How did they shape you?</strong><br>
            Find the gifts within your difficulties and how they've contributed to your growth.</li>
            
            <li><strong>What aspects of your ordinary life would have seemed miraculous to your younger self?</strong><br>
            Gain perspective on how far you've come and what you might take for granted.</li>
            
            <li><strong>What in nature brings you the most peace or wonder? Describe your connection to this element in detail.</strong><br>
            Explore your relationship with the natural world and how it nourishes you.</li>
          </ol>
          
          <h3>Tips for Deep Journaling</h3>
          
          <ul>
            <li><strong>Create a ritual</strong> around your journaling practice to signal to your brain that it's time for reflection</li>
            <li><strong>Write without censoring</strong> yourself—this is for your eyes only</li>
            <li><strong>Set a timer</strong> for 10-15 minutes to dive deep into a single prompt</li>
            <li><strong>Follow tangents</strong> when they arise—they often lead to unexpected insights</li>
            <li><strong>Review periodically</strong> to notice patterns and growth over time</li>
          </ul>
          
          <p>Remember that journaling is not about finding "correct" answers but about exploring your inner landscape with curiosity and compassion. There are no wrong responses—only opportunities for greater self-awareness.</p>
        `),
        summary: encryptData("Journaling is a powerful tool for self-reflection. Try these carefully crafted prompts designed to help you gain deeper insights into your values, goals, and personal growth journey..."),
        imageUrl: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "Self-Growth",
        tags: ["self-growth", "journaling", "reflection", "personal-development"],
        authorId: adminId,
        author: "admin",
      }
    ];

    // Insert posts
    for (const post of posts) {
      await db.insert(schema.posts)
        .values({
          ...post,
          createdAt: new Date(),
        });
    }

    console.log(`Added ${posts.length} blog posts to the database`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
