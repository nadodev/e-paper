-- AlterTable
ALTER TABLE `user` MODIFY `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    MODIFY `updatedAt` TIMESTAMP(6) NOT NULL;