"use client";

import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function WhopCheckoutModal({ planId, clientEmail, onClose }: { planId: string; clientEmail: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete payment</DialogTitle>
        </DialogHeader>
        <WhopCheckoutEmbed
          planId={planId}
          theme="dark"
          prefill={{ email: clientEmail }}
          skipRedirect
          onComplete={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
