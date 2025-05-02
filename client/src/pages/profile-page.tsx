import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "../lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const PLACEHOLDER_IMAGE = "https://ui-avatars.com/api/?name=User&background=eee&color=888&size=128";

export default function ProfilePage() {
  const { user } = useAuth();
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setBio(data.bio || "");
        setImage(data.image || null);
      } else {
        setBio(user?.bio || "");
        setImage(user?.image || null);
      }
      setLoading(false);
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, image: image || "" }),
      });
      if (res.ok) {
        setSuccess(true);
        // Refetch user globally so navbar/profile icon updates
        await queryClient.invalidateQueries(["/api/user"]);
        toast({
          title: "Profile updated!",
          description: "Your profile changes have been saved.",
        });
      } else {
        toast({
          title: "Failed to save profile",
          description: "Please try again.",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to save profile",
        description: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar forceSolid />
      <main className="flex-1 bg-soft-gray py-12 px-4 flex flex-col items-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl mt-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center font-poppins">My Profile</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 mb-4">
                  {loading ? (
                    <Skeleton className="w-28 h-28 rounded-full" />
                  ) : (
                    <motion.img
                      src={image || user?.image || PLACEHOLDER_IMAGE}
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover border-2 border-muted-blue shadow"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  )}
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-muted-blue text-white rounded-full p-2 shadow hover:bg-soft-coral transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload profile image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="text-center">
                  {loading ? (
                    <>
                      <Skeleton className="h-6 w-32 mb-2 mx-auto" />
                      <Skeleton className="h-4 w-40 mx-auto" />
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-lg">{user?.username}</div>
                      <div className="text-gray-500 text-sm">{user?.email}</div>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="bio">Bio</label>
                {loading ? (
                  <Skeleton className="h-24 w-full rounded-md" />
                ) : (
                  <textarea
                    id="bio"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-muted-blue"
                    rows={4}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                )}
              </div>
              <motion.button
                type="submit"
                className="w-full bg-muted-blue text-white py-2 rounded-md font-medium hover:bg-opacity-90 transition-colors disabled:opacity-60"
                disabled={saving}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
              {success && (
                <div className="text-green-600 text-center font-medium">Profile updated!</div>
              )}
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 