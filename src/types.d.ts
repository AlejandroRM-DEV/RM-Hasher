export type Record = {
	path: string;
	blake3?: string;
	sha3_256?: string;
	sha3_512?: string;
	sha256?: string;
	sha512?: string;
	sha1?: string;
	md5?: string;
};

export type Algorithm = "blake3" | "sha1" | "sha256" | "sha512" | "sha3_256" | "sha3_512" | "md5";
