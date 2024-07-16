import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const AdminPage = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div>
      This is admin dashboard
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
};

export default AdminPage;