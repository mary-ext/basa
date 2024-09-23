import { error } from 'elysia';

export class XrpcError extends Error {
	constructor(
		public status: number,
		public kind: string,
		message: string,
	) {
		super(message);
	}

	toResponse() {
		return error(this.status, { error: this.kind, message: this.message });
	}
}

export class InvalidRequestError extends XrpcError {
	constructor(message: string, kind: string = 'InvalidRequest') {
		super(400, kind, message);
	}
}

export class UpstreamFailureError extends XrpcError {
	constructor(message: string, kind: string = 'UpstreamFailure') {
		super(502, kind, message);
	}
}
