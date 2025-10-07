import { UserDetail } from "@/components/users/user-detail"

type UserDetailPageProps = {
  params: Promise<{
    userId: string
  }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params
  return <UserDetail userId={userId} />
}
