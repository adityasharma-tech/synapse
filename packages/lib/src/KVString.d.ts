declare const KV: {
    stringify(data: Record<string, string | number | boolean>): string;
    jsonify(input: string): Record<string, string | number | boolean>;
};
export { KV };
