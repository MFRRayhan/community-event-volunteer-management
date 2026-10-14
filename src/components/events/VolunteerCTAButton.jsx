"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import RegistrationModal from "@/components/registration/RegistrationModal";
import { FiSlash, FiClock, FiHeart } from "react-icons/fi";
import Swal from "sweetalert2";

export default function VolunteerCTAButton({
  eventId,
  eventTitle,
  requiredSkills = [],
  isFull,
  deadlinePassed,
  availableSlots,
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAction = () => {
    // 1. If not authenticated, redirect to login
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/events/${eventId}`);
      return;
    }

    // 2. If logged in as organizer, show friendly guidance
    if (session.user.role === "organizer") {
      Swal.fire({
        icon: "warning",
        title: "Organizer Account",
        text: "You are signed in as an Organizer. To register for events, please log in with a Volunteer account.",
        confirmButtonText: "Got it",
        confirmButtonColor: "#3085d6",
      });

      return;
    }

    // 3. Open registration modal for volunteer
    setIsModalOpen(true);
  };

  if (isFull) {
    return (
      <div className="space-y-2">
        <button
          disabled
          className="w-full py-3.5 px-6 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold text-sm cursor-not-allowed border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2"
        >
          <FiSlash className="w-4 h-4" />
          <span>Event Capacity Full</span>
        </button>
        <p className="text-xs text-center text-slate-500">
          All volunteer slots have been filled for this initiative.
        </p>
      </div>
    );
  }

  if (deadlinePassed) {
    return (
      <div className="space-y-2">
        <button
          disabled
          className="w-full py-3.5 px-6 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-sm cursor-not-allowed border border-amber-300 dark:border-amber-800 flex items-center justify-center gap-2"
        >
          <FiClock className="w-4 h-4" />
          <span>Registration Closed</span>
        </button>
        <p className="text-xs text-center text-slate-500">
          The registration deadline for this initiative has passed.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={handleAction}
          className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <FiHeart className="w-4 h-4" />
          <span>
            {status === "authenticated"
              ? "Volunteer Now"
              : "Sign In to Volunteer"}
          </span>
        </button>

        {status !== "authenticated" ? (
          <p className="text-xs text-center text-slate-500">
            Sign in with your volunteer account to secure a shift.
          </p>
        ) : session?.user?.role === "organizer" ? (
          <p className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium">
            Logged in as Organizer (Switch to a Volunteer account to register)
          </p>
        ) : (
          <p className="text-xs text-center text-emerald-600 dark:text-emerald-400 font-medium">
            {availableSlots} spots available!
          </p>
        )}
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={eventId}
        eventTitle={eventTitle}
        requiredSkills={requiredSkills}
      />
    </>
  );
}
