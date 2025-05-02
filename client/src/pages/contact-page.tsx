import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactForm from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar forceSolid />
      <main className="flex-1">
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
} 