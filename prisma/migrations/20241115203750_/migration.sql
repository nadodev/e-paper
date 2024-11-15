-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `emitente` VARCHAR(191) NOT NULL,
    `valor_total_tributos` DECIMAL(10, 2) NOT NULL,
    `valor_liquido` DECIMAL(10, 2) NOT NULL,
    `data_criacao` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `ultima_atualizacao` TIMESTAMP(6) NOT NULL,

    UNIQUE INDEX `Document_codigo_key`(`codigo`),
    INDEX `Document_codigo_idx`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
