import { TaskCard } from '@/components/cards/TaskCard';
import { TaskColumn } from '@/components/cards/TaskColumn';

export default function Main() {
  return (
    <TaskColumn>
      <TaskCard />
      <TaskCard />
      <TaskCard />
    </TaskColumn>
  );
}
