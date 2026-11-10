import { useEffect, useRef } from "react";
import { initials, todayLabel } from "../domain/format";
import { getSession, updateData, updateSession, useSession, useVault } from "../state/store";

const replies = new Set<number>();

export function Messages() {
  const data = useVault();
  const session = useSession();
  const input = useRef<HTMLInputElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const thread = data.threads.find((item) => item.id === session.threadId) ?? data.threads[0];

  useEffect(() => {
    if (!thread?.unread) return;
    const id = thread.id;
    updateData((d) => {
      const current = d.threads.find((item) => item.id === id);
      if (current) current.unread = 0;
    });
  }, [thread?.id, thread?.unread]);

  useEffect(() => {
    if (!session.messageDraft || !input.current) return;
    input.current.value = session.messageDraft;
    input.current.focus();
    updateSession((s) => { s.messageDraft = null; });
  }, [session.messageDraft, thread?.id]);

  useEffect(() => {
    if (body.current) body.current.scrollTop = body.current.scrollHeight;
  }, [thread?.id, thread?.msgs.length]);

  useEffect(() => () => {
    replies.forEach((id) => window.clearTimeout(id));
    replies.clear();
  }, []);

  if (!thread) return <h1>Messages</h1>;
  const first = thread.who.split(" ")[0];

  return (
    <>
      <h1>Messages</h1>
      <p className="hint">Secure messages with your Vault team. Replies usually arrive within one business day.</p>
      <div className="msg-wrap">
        <div className="threads">
          {data.threads.map((item) => {
            const last = item.msgs[item.msgs.length - 1];
            return (
              <button key={item.id} className={"thread" + (item.id === thread.id ? " on" : "")} type="button" onClick={() => updateSession((s) => { s.threadId = item.id; })}>
                <span className="avatar">{initials(item.who)}</span>
                <span className="tt">
                  <b>{item.who}{item.unread ? <i className="dot" /> : null}</b>
                  <span>{last ? last.text : item.role}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="convo">
          <div className="convo-h"><b>{thread.who}</b><span>{thread.role}</span></div>
          <div className="convo-b" ref={body}>
            {thread.msgs.length ? thread.msgs.map((message, i) => (
              <div className={"bub " + message.from} key={i}>
                <p>{message.text}</p>
                <span>{message.at}</span>
              </div>
            )) : <p className="empty">Start a conversation with {first}.</p>}
          </div>
          <form
            className="convo-f"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const text = input.current?.value.trim() ?? "";
              if (!text || !input.current) return;
              const id = thread.id;
              input.current.value = "";
              updateData((d) => {
                const current = d.threads.find((item) => item.id === id);
                current?.msgs.push({ from: "me", text, at: todayLabel() });
              });
              const timer = window.setTimeout(() => {
                replies.delete(timer);
                const still = getSession().threadId === id && location.hash === "#messages";
                updateData((d) => {
                  const current = d.threads.find((item) => item.id === id);
                  if (!current) return;
                  current.msgs.push({
                    from: "them",
                    text: "Thanks, " + d.profile.name.split(" ")[0] + ". I’ve got this and will follow up shortly.",
                    at: todayLabel(),
                  });
                  if (!still) current.unread += 1;
                });
              }, 1400);
              replies.add(timer);
            }}
          >
            <input ref={input} placeholder={"Write a message to " + first} aria-label="Message" />
            <button className="btn btn-dark sm" type="submit">Send</button>
          </form>
        </div>
      </div>
    </>
  );
}
