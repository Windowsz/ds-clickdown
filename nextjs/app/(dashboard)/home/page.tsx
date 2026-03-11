import HomePage from '@/components/features/home/HomePage';

export const metadata = { title: 'Home — ClickDown' };

export default function Page() {
  return (
    <div className="flex-1 overflow-y-auto">
      <HomePage />
    </div>
  );
}
