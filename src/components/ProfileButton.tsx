"use client";

import { PersonIcon } from "@/icons/Person";
import { Session } from "next-auth";
import Popover from "./Popover";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/useIsMobile";

type ProfileButtonProps = {
  session?: Session | null;
};

export const ProfileButton: React.FC<ProfileButtonProps> = ({ session }) => {
  const router = useRouter();
  const isMobile = useIsMobile();

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    if (session) {
      await signOut({ callbackUrl: "/login" });
    }
    return;
  };

  const handleNavigateToProfile = () => {
    if (session) {
      router.push("/profile");
    }
  };

  const title = session.user?.name || "User";

  const options = [
    {
      id: "2",
      item: "Profile",
      href: "/profile",
      onClick: handleNavigateToProfile,
    },
    {
      id: "1",
      item: "Log out",
      onClick: handleLogout,
    },
  ];

  return (
    <Popover
      trigger={<Trigger />}
      options={options}
      showArrow={false}
      side={isMobile ? "top" : "right"}
      align="end"
      title={title}
    />
  );
};

const Trigger = () => {
  return (
    <div className="flex  p-[12px]  hover:cursor-pointer border-l md:border-t md:border-l-0 border-default">
      <PersonIcon size={20} />
    </div>
  );
};
