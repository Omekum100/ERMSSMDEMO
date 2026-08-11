import { callRepository } from "@/lib/mockRepository";
import { todayIso } from "@/lib/utils";
import type { CallRecord, CallStatus } from "@/types/call";

export type CallSessionState = {
  call: CallRecord;
  elapsedSeconds: number;
  status: CallStatus;
};

export type CallCallbacks = {
  onStatusChange: (state: CallSessionState) => void;
  onFinish: (state: CallSessionState) => void;
};

export type CallingSessionController = {
  endCall: () => void;
};

export interface CallingProvider {
  startCall(call: CallRecord, callbacks: CallCallbacks): CallingSessionController;
}

export class MockCallingProvider implements CallingProvider {
  startCall(call: CallRecord, callbacks: CallCallbacks): CallingSessionController {
    let status: CallStatus = "INITIATED";
    let elapsedSeconds = 0;
    let connectedAt: string | undefined;
    let ringingTimeout: ReturnType<typeof setTimeout> | undefined;
    let connectedTimeout: ReturnType<typeof setTimeout> | undefined;
    let timer: ReturnType<typeof setInterval> | undefined;

    const emit = () => callbacks.onStatusChange({ call: { ...call, status, connectedAt }, elapsedSeconds, status });
    emit();

    ringingTimeout = setTimeout(() => {
      status = "RINGING";
      callRepository.update(call.id, { status });
      emit();
    }, 1000);

    connectedTimeout = setTimeout(() => {
      status = "CONNECTED";
      connectedAt = todayIso();
      callRepository.update(call.id, { status, connectedAt });
      emit();
      timer = setInterval(() => {
        elapsedSeconds += 1;
        emit();
      }, 1000);
    }, 3000);

    const finish = (finalStatus: CallStatus) => {
      if (ringingTimeout) clearTimeout(ringingTimeout);
      if (connectedTimeout) clearTimeout(connectedTimeout);
      if (timer) clearInterval(timer);
      status = finalStatus;
      const endedAt = todayIso();
      const payload: Partial<CallRecord> = {
        status: finalStatus,
        endedAt,
        connectedAt,
        durationSeconds: connectedAt ? elapsedSeconds : 0,
      };
      const updated = callRepository.update(call.id, payload) ?? { ...call, ...payload };
      callbacks.onFinish({ call: updated, elapsedSeconds, status });
    };

    return {
      endCall: () => {
        finish(status === "CONNECTED" ? "COMPLETED" : "CANCELLED");
      },
    };
  }
}

