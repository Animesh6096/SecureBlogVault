import { connectDB, disconnectDB } from './mongodb';
import { User, Post } from '../shared/mongodb-schema';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { encryptData } from '../server/encryption';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await connectDB();
  
  try {
    console.log('Seeding admin user...');
    // Check if admin user exists
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      const adminPassword = await hashPassword('admin123');
      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        createdAt: new Date()
      });
      
      await admin.save();
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists, skipping...');
    }
    
    console.log('Seeding sample blog posts...');
    // Check if we already have posts
    const postCount = await Post.countDocuments();
    
    if (postCount === 0) {
      const admin = await User.findOne({ username: 'admin' });
      
      if (!admin) {
        throw new Error('Admin user not found, cannot seed posts');
      }
      
      const samplePosts = [
        {
          title: '10 Ways to Practice Mindfulness in Your Daily Life',
          content: encryptData(`
Mindfulness has become a buzzword in recent years, but its benefits for mental health and wellbeing are well-documented. Here are 10 simple ways to incorporate mindfulness into your daily routine:

1. **Start your day with intention**: Take a few minutes each morning to set an intention for the day.
2. **Mindful breathing**: Several times throughout the day, take 5 deep breaths and really focus on the sensation.
3. **Engage your senses**: When eating, focus on the taste, texture, and smell of your food.
4. **Single-tasking**: Try doing just one thing at a time, giving it your full attention.
5. **Walking meditation**: Turn a regular walk into a mindful activity by paying attention to each step.
6. **Body scan**: Take a few minutes to mentally scan your body from head to toe, noticing any sensations.
7. **Mindful listening**: Give your full attention when someone is speaking to you.
8. **Digital detox**: Set aside times when you completely disconnect from technology.
9. **Gratitude practice**: Each night, reflect on three things you're grateful for.
10. **Mindful transitions**: Use transitions between activities as mindfulness triggers.

Remember, mindfulness isn't about being perfect. It's about consistently returning your attention to the present moment with kindness and curiosity.
          `),
          summary: encryptData('Discover practical ways to incorporate mindfulness into your everyday life for better mental health and wellbeing.'),
          imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVkaXRhdGlvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
          category: 'Mindfulness',
          tags: ['meditation', 'wellness', 'mental health'],
          authorId: admin._id,
          author: admin.username,
          createdAt: new Date(),
          featured: true
        },
        {
          title: 'The Power of a Morning Routine',
          content: encryptData(`
How you start your morning can set the tone for your entire day. A thoughtful morning routine can boost your productivity, reduce stress, and improve your overall wellbeing. Here's how to create a morning routine that works for you:

## Why Morning Routines Matter

Research shows that willpower is typically highest in the morning. By creating a consistent routine, you take advantage of this natural peak in self-discipline. Additionally, morning routines can:

- Reduce decision fatigue
- Lower stress levels
- Increase productivity
- Improve physical health
- Enhance mental clarity

## Elements of an Effective Morning Routine

1. **Wake up at a consistent time**: Try to wake up at the same time each day, even on weekends.
2. **Hydrate**: Drink a full glass of water first thing to rehydrate your body.
3. **Move your body**: Even just 5-10 minutes of stretching or light exercise can energize you.
4. **Mindfulness practice**: Meditation, journaling, or simply sitting quietly can center your mind.
5. **Nutritious breakfast**: Fuel your body with a balanced meal.
6. **Plan your day**: Take a few minutes to review your schedule and priorities.

## Sample 30-Minute Morning Routine

- 5 minutes: Hydrate and stretch
- 10 minutes: Meditation or journaling
- 10 minutes: Quick workout
- 5 minutes: Planning and prioritizing

Remember, the best morning routine is one that you can stick with consistently. Start small and gradually build up to your ideal morning.
          `),
          summary: encryptData('Learn how establishing a consistent morning routine can transform your productivity and wellbeing.'),
          imageUrl: 'https://images.unsplash.com/photo-1506968430777-bf7784a87f23?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG1vcm5pbmclMjByb3V0aW5lfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
          category: 'Productivity',
          tags: ['habits', 'routine', 'wellness'],
          authorId: admin._id,
          author: admin.username,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          featured: true
        },
        {
          title: '20 Thought-Provoking Journal Prompts for Self-Discovery',
          content: encryptData(`
Journaling is a powerful tool for self-reflection and personal growth. If you're looking to deepen your self-awareness, try these thought-provoking journal prompts:

1. What are three beliefs I hold that limit my potential?
2. If I could give advice to my younger self, what would I say?
3. What am I most grateful for in my life right now?
4. What does success mean to me, personally?
5. When do I feel most alive and energized?
6. What negative thoughts do I tend to ruminate on most frequently?
7. If I had unlimited resources, how would I spend my time?
8. What are my top five values, and am I living in alignment with them?
9. What patterns or behaviors would I like to change in my life?
10. Who are the people who bring out the best in me?
11. What am I holding onto that I need to let go of?
12. What would I do if I knew I couldn't fail?
13. How have my biggest challenges shaped who I am today?
14. What does my ideal day look like, from morning to night?
15. How do I define forgiveness, and who might I need to forgive?
16. What am I avoiding or procrastinating on, and why?
17. What would I like to be remembered for?
18. How do I typically respond to stress, and how might I respond better?
19. What brings me genuine joy that I'm not making enough time for?
20. What am I most afraid of, and what would happen if I faced that fear?

Remember, journaling is most effective when done regularly. Try setting aside 10-15 minutes each day to reflect on one of these prompts. Don't worry about perfect writing—this is for your eyes only. The goal is honest self-reflection.
          `),
          summary: encryptData('Explore these powerful journaling questions to deepen your self-awareness and accelerate personal growth.'),
          imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8am91cm5hbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
          category: 'Personal Growth',
          tags: ['journaling', 'self-discovery', 'reflection'],
          authorId: admin._id,
          author: admin.username,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          featured: true
        }
      ];
      
      await Post.insertMany(samplePosts);
      console.log('Sample blog posts created successfully.');
    } else {
      console.log('Posts already exist, skipping...');
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await disconnectDB();
  }
}

// Run the seed function
seed().catch(console.error);