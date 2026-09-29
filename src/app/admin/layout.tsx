import { AdminNav } from "@/components/admin/AdminNav";
import { Container } from "@/components/layout/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";

/** Every back-office page requires the admin role (members get a 404). */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <Container className="pb-12">
      <div className="pt-6">
        <AdminNav />
      </div>
      {children}
    </Container>
  );
}
