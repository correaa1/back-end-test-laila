import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1715129458000 implements MigrationInterface {
  name = 'CreateInitialTables1715129458000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela de usuários
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de categorias
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela de transações
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "type" character varying NOT NULL,
        "date" date NOT NULL,
        "user_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
      )
    `);

    // Adicionar chave estrangeira para categorias -> usuários
    await queryRunner.query(`
      ALTER TABLE "categories" 
      ADD CONSTRAINT "FK_categories_users" 
      FOREIGN KEY ("user_id") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    // Adicionar chave estrangeira para transações -> usuários
    await queryRunner.query(`
      ALTER TABLE "transactions" 
      ADD CONSTRAINT "FK_transactions_users" 
      FOREIGN KEY ("user_id") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    // Adicionar chave estrangeira para transações -> categorias
    await queryRunner.query(`
      ALTER TABLE "transactions" 
      ADD CONSTRAINT "FK_transactions_categories" 
      FOREIGN KEY ("category_id") 
      REFERENCES "categories"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover chaves estrangeiras
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_categories"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_users"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_users"`);

    // Remover tabelas
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
} 