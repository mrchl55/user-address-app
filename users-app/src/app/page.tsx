import { UsersList } from "./components/UsersList";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      <UsersList />
    </main>
  );
}
