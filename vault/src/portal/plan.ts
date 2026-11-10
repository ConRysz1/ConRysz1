import { money } from "../domain/format";
import { serviceById, type ServiceId } from "../domain/pricing";
import { getData, updateData } from "../state/store";
import { confirmBox, toast } from "../ui/overlays";

export function askAddService(id: ServiceId) {
  const svc = serviceById(id);
  if (!svc) return;
  const amount = money(svc.calc(getData()));
  confirmBox({
    title: "Add " + svc.name + "?",
    body: "This adds " + amount + " a month to your plan, starting next billing cycle. Your relationship lead will be in touch to set it up.",
    ok: "Add service",
    onOk: () => {
      updateData((d) => {
        d.active[id] = true;
      });
      toast(svc.name + " added");
    },
  });
}

export function askRemoveService(id: ServiceId) {
  const svc = serviceById(id);
  if (!svc) return;
  const amount = money(svc.calc(getData()));
  confirmBox({
    title: "Remove " + svc.name + "?",
    body: "This removes " + amount + " a month from your plan at the end of the billing cycle.",
    ok: "Remove service",
    onOk: () => {
      updateData((d) => {
        d.active[id] = false;
      });
      toast(svc.name + " removed");
    },
  });
}
