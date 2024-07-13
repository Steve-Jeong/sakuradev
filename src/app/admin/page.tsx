import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const AdminPage = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div>
      This is admin dashboard
      {JSON.stringify(session)}
    </div>
  );
};

export default AdminPage;