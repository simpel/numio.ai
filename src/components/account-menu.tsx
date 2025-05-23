'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoPersonCircleOutline } from 'react-icons/io5';

import { ActionResponse } from '@/types/action-response';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuArrow,
} from '@radix-ui/react-dropdown-menu';

export function AccountMenu({ signOut }: { signOut: () => Promise<ActionResponse> }) {
  const router = useRouter();

  async function handleLogoutClick() {
    const response = await signOut();

    if (response?.error) {
      toast.error('An error occurred while logging out. Please try again or contact support.');
    } else {
      router.refresh();

      toast.success('You have been logged out.');
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='rounded-full'>
        <IoPersonCircleOutline size={24} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='me-4'>
        <DropdownMenuItem asChild>
          <Link href='/account'>Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogoutClick}>Log Out</DropdownMenuItem>
        <DropdownMenuArrow className='me-4 fill-white' />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
