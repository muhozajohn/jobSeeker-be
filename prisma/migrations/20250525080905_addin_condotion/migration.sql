-- DropForeignKey
ALTER TABLE "Recruiter" DROP CONSTRAINT "Recruiter_userId_fkey";

-- AddForeignKey
ALTER TABLE "Recruiter" ADD CONSTRAINT "Recruiter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
