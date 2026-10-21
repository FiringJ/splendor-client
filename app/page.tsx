import GameLayout from './components/GameLayout';
import { parseRoomQueryParam } from './lib/parseRoomQueryParam';

type HomeProps = {
  searchParams: Promise<{ room?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.room) ? params.room[0] : params.room;
  const initialRoomId = parseRoomQueryParam(raw);

  return <GameLayout initialRoomId={initialRoomId} />;
}
