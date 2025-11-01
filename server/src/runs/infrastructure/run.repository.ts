// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from "@nestjs/common";

import { PythonRunsClient, PythonRunEvent, PythonRunStatusResponse } from '../python-runs.client';

export interface CreateRunResponse {
  id: string;
  status: string;
}

export interface StreamOptions {
  onEvent: (event: PythonRunEvent) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

/**
 * RunRepository는 외부 Python 런 서비스와의 통신을 담당합니다.
 * PythonRunsClient를 래핑하여 도메인 레이어에서 사용하기 쉬운 인터페이스를 제공합니다.
 */
@Injectable()
export class RunRepository {
  private readonly logger = new Logger(RunRepository.name);

  constructor(private readonly pythonRunsClient: PythonRunsClient) {}

  async createRun(dto: any): Promise<CreateRunResponse> {
    try {
      const response = await this.pythonRunsClient.createRun(dto);
      return { id: response.id, status: response.status };
    } catch (error) {
      this.logger.error("Failed to create run", error as Error);
      throw error;
    }
  }

  async getRun(id: string): Promise<PythonRunStatusResponse> {
    try {
      return await this.pythonRunsClient.getRun(id);
    } catch (error) {
      this.logger.error(`Failed to get run ${id}`, error as Error);
      throw error;
    }
  }

  streamRun(id: string, options: StreamOptions): () => void {
    try {
      return this.pythonRunsClient.streamRun(id, options);
    } catch (error) {
      this.logger.error(`Failed to stream run ${id}`, error as Error);
      options.onError(error as Error);
      return () => {};
    }
  }
}
