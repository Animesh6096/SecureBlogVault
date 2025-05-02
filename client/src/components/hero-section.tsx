import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}>
      <div className="hero-overlay absolute inset-0"></div>
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-poppins mb-6">Thoughts, Ideas, Stories</h1>
        <p className="text-lg md:text-xl text-white max-w-2xl mb-8">A minimalist blog focused on mindful living, productivity, and personal growth.</p>
        <Link href="/blog" className="bg-soft-coral text-white px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors shadow-lg">
          Start Reading
        </Link>
      </div>
    </section>
  );
}
