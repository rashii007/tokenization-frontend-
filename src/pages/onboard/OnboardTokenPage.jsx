import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import successIcon from "../../assets/images/check-green-circle.svg";

const TOKEN_OPTIONS = [
  { label: "Kissan Token", value: "kissan" },
  { label: "Livestock Token", value: "livestock" },
  { label: "Ration Card Token", value: "ration" },
  { label: "Kissan Card & Other", value: "other" },
  { label: "Other", value: "general" },
];

const INITIAL_FORM = {
  tokenId: "",
  tokenName: "",
  tokenNumber: "",
  tokenType: "",
  description: "",
};

export default function OnboardTokenPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState(INITIAL_FORM);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field) => (event) => {
    setFormState((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { tokenId, tokenName, tokenNumber, tokenType, description } =
      formState;

    if (!tokenId || !tokenName || !tokenNumber || !tokenType || !description) {
      alert("Please fill all fields");
      return;
    }

    setShowSuccess(true);
  };

  const handleReset = () => {
    setFormState(INITIAL_FORM);
    setShowSuccess(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-5 text-xs text-slate-500">
        Operations / Token / <span className="text-sky-400">Add Token</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100">Add Token</h1>
        <p className="mt-1 text-sm text-slate-400">
          Register a new token on the portal
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0b1220]/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <div className="mb-4 text-[11px] font-semibold tracking-wider text-slate-500">
              TOKEN INFORMATION
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Token ID <span className="text-rose-400">*</span>
                </label>

                <InputText
                  value={formState.tokenId}
                  onChange={handleChange("tokenId")}
                  placeholder="e.g. TKN-10005"
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !px-4 !py-3 !text-sm !text-slate-100 placeholder:!text-slate-500 focus:!shadow-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Token Type <span className="text-rose-400">*</span>
                </label>

                <Dropdown
                  value={formState.tokenType}
                  options={TOKEN_OPTIONS}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      tokenType: event.value,
                    }))
                  }
                  placeholder="Select token type"
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !text-sm !text-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Token Name <span className="text-rose-400">*</span>
                </label>

                <InputText
                  value={formState.tokenName}
                  onChange={handleChange("tokenName")}
                  placeholder="e.g. Kissan Token"
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !px-4 !py-3 !text-sm !text-slate-100 placeholder:!text-slate-500 focus:!shadow-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Token Number <span className="text-rose-400">*</span>
                </label>

                <InputText
                  value={formState.tokenNumber}
                  onChange={handleChange("tokenNumber")}
                  placeholder="e.g. PK-TKN-005"
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !px-4 !py-3 !text-sm !text-slate-100 placeholder:!text-slate-500 focus:!shadow-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Description <span className="text-rose-400">*</span>
                </label>

                <InputText
                  value={formState.description}
                  onChange={handleChange("description")}
                  placeholder="Enter token description"
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !px-4 !py-3 !text-sm !text-slate-100 placeholder:!text-slate-500 focus:!shadow-none"
                />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 text-[11px] font-semibold tracking-wider text-slate-500">
              TOKEN STATUS
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-sm text-slate-300">
                  Token will be created as Active
                </span>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              label="Create Token"
              className="!rounded-lg !border !border-sky-500/30 !bg-sky-500/15 !px-4 !py-2.5 !text-xs !font-semibold !text-sky-200 hover:!bg-sky-500/20"
            />

            <Button
              type="button"
              label="Reset"
              onClick={handleReset}
              className="!rounded-lg !border !border-white/10 !bg-white/5 !px-4 !py-2.5 !text-xs !font-semibold !text-slate-100 hover:!bg-white/10"
            />
          </div>
        </form>
      </div>

      <Dialog
        visible={showSuccess}
        onHide={() => setShowSuccess(false)}
        dismissableMask={false}
        closeOnEscape={false}
        breakpoints={{ "768px": "95vw" }}
        style={{ width: "min(1064px, 90vw)" }}
        className="onboard-modal"
        showHeader={false}
      >
        <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-8 text-center text-slate-100">
          <img
            src={successIcon}
            alt="Success"
            className="mx-auto mb-4 h-12 w-12"
          />

          <p className="text-base font-semibold">
            Token <span className="text-sky-300">{formState.tokenId}</span>{" "}
            Created Successfully!
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              label="Close"
              onClick={() => {
                setShowSuccess(false);
                navigate("/tokens");
              }}
              className="!rounded-xl !border !border-white/10 !bg-white/5 !px-6 !py-3 !text-sm !font-semibold !text-slate-100 hover:!bg-white/10"
            />

            <Button
              type="button"
              label="Add New Token"
              onClick={handleReset}
              className="!rounded-xl !border !border-sky-500/30 !bg-sky-500/15 !px-6 !py-3 !text-sm !font-semibold !text-sky-200 hover:!bg-sky-500/20"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
