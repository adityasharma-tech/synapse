declare const schema: import("drizzle-orm/pg-core").PgSchema<"upgrade">;
declare const timestamps: {
    updatedAt: import("drizzle-orm").HasDefault<
        import("drizzle-orm/pg-core").PgTimestampBuilderInitial<"">
    >;
    createdAt: import("drizzle-orm").NotNull<
        import("drizzle-orm").HasDefault<
            import("drizzle-orm/pg-core").PgTimestampBuilderInitial<"">
        >
    >;
};
export { timestamps, schema };
