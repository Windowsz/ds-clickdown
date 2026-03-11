'use client';

import { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';
import SpacePage from '@/components/features/space/SpacePage';

export default function Page({ params }: { params: { spaceId: string } }) {
  const { setActiveSpace } = useWorkspaceStore();

  useEffect(() => {
    setActiveSpace(params.spaceId);
  }, [params.spaceId]);

  return <SpacePage />;
}
