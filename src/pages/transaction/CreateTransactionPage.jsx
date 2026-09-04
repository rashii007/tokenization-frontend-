import { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import api from "../../network/api";
import successIcon from "../../assets/images/check-green-circle.svg";

const TRANSACTION_TYPES = [
  { label: "Sale", value: "sale" },
  { label: "Refund", value: "refund" },
  { label: "Void", value: "void" },
  { label: "Reversal", value: "reversal" },
];

const CARD_TYPES = [
  { label: "Visa", value: "Visa" },
  { label: "Mastercard", value: "Mastercard" },
  { label: "PayPak", value: "PayPak" },
  { label: "LiveStock Card", value: "LiveStock Card" },
  { label: "Asan Card", value: "Asan Card" },
  { label: "Rashan Card", value: "Rashan Card" },
  { label: "Kisan Card", value: "Kisan Card" },
  { label: "Karobar Card", value: "Karobar Card" },
];

const INITIAL_FORM = {
  transactionType: "",
  amount: "",
  cardType: "",
  currencyCode: "0586",
  referenceNumber: "",
  description: "",
};

export default function CreateTransactionPage() {
  const [transactionType, setTransactionType] = useState("");
  const [amount, setAmount] = useState("");
  const [cardType, setCardType] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currencyCode = "0586";

  const handleReset = () => {
    setTransactionType(INITIAL_FORM.transactionType);
    setAmount(INITIAL_FORM.amount);
    setCardType(INITIAL_FORM.cardType);
    setReferenceNumber(INITIAL_FORM.referenceNumber);
    setDescription(INITIAL_FORM.description);
    setShowSuccess(false);
  };

  const handleCloseDialog = () => {
    setShowSuccess(false);
  };

  const handleCreateAnother = () => {
    handleReset();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!transactionType) {
      alert("Please select Transaction Type");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid transaction amount");
      return;
    }

    if (!cardType) {
      alert("Please select Card Type");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        transactionType,
        amount: Number(amount),
        cardType,
        currencyCode,
        referenceNumber,
        description,
      };

      const response = await api.post(
        "/createTransaction",
        payload
      );

      if (response.data?.isSuccess) {
        setShowSuccess(true);
      } else {
        alert(
          response.data?.message ||
            "Transaction creation failed"
        );
      }
    } catch (error) {
      console.error("Transaction Error:", error);

      alert(
        error?.response?.data?.message ||
          "Something went wrong while creating transaction"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-5 text-xs text-slate-500">
        Operations / Transactions /{" "}
        <span className="text-sky-400">
          Create Transaction
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100">
          Create Transaction
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Create a new transaction on the portal
        </p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0b1220]/70 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <div className="mb-4 text-[11px] font-semibold tracking-wider text-slate-500">
              TRANSACTION INFORMATION
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Transaction Type{" "}
                  <span className="text-rose-400">*</span>
                </label>

                <Dropdown
                  value={transactionType}
                  options={TRANSACTION_TYPES}
                  onChange={(e) =>
                    setTransactionType(e.value)
                  }
                  placeholder="Select Transaction Type"
                  filter
                  filterBy="label"
                  filterPlaceholder="Search Transaction Type..."
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !text-sm !text-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Card Type{" "}
                  <span className="text-rose-400">*</span>
                </label>

                <Dropdown
                  value={cardType}
                  options={CARD_TYPES}
                  onChange={(e) =>
                    setCardType(e.value)
                  }
                  placeholder="Select Card Type"
                  filter
                  filterBy="label"
                  filterPlaceholder="Search Card Type..."
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !text-sm !text-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Amount{" "}
                  <span className="text-rose-400">*</span>
                </label>

                <InputText
                  type="number"
                  value={amount}
                  onChange={(event) =>
                    setAmount(event.target.value)
                  }
                  placeholder="Enter transaction amount"
                  min="0"
                  step="0.01"
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !px-4 !py-3 !text-sm !text-slate-100 placeholder:!text-slate-500 focus:!shadow-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Currency Code
                </label>

                <InputText
                  value={currencyCode}
                  disabled
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !px-4 !py-3 !text-sm !text-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Reference Number
                </label>

                <InputText
                  value={referenceNumber}
                  onChange={(event) =>
                    setReferenceNumber(event.target.value)
                  }
                  placeholder="Enter reference number"
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !px-4 !py-3 !text-sm !text-slate-100 placeholder:!text-slate-500 focus:!shadow-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Transaction Date
                </label>

                <InputText
                  type="date"
                  defaultValue={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !px-4 !py-3 !text-sm !text-slate-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  Description
                </label>

                <InputText
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Enter transaction description"
                  className="w-full !rounded-xl !border !border-white/10 !bg-black/20 !px-4 !py-3 !text-sm !text-slate-100 placeholder:!text-slate-500 focus:!shadow-none"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              label={
                submitting
                  ? "Creating..."
                  : "Create Transaction"
              }
              disabled={submitting}
              className="!rounded-lg !border !border-sky-500/30 !bg-sky-500/15 !px-4 !py-2.5 !text-xs !font-semibold !text-sky-200 hover:!bg-sky-500/20"
            />

            <Button
              type="button"
              label="Reset"
              onClick={handleReset}
              disabled={submitting}
              className="!rounded-lg !border !border-white/10 !bg-white/5 !px-4 !py-2.5 !text-xs !font-semibold !text-slate-100 hover:!bg-white/10"
            />
          </div>
        </form>
      </div>

      <Dialog
        visible={showSuccess}
        onHide={handleCloseDialog}
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
            Transaction{" "}
            <span className="text-sky-300">
              {referenceNumber || "Created"}
            </span>{" "}
            Created Successfully!
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              label="Close"
              onClick={handleCloseDialog}
              className="!rounded-xl !border !border-white/10 !bg-white/5 !px-6 !py-3 !text-sm !font-semibold !text-slate-100 hover:!bg-white/10"
            />

            <Button
              type="button"
              label="Create New Transaction"
              onClick={handleCreateAnother}
              className="!rounded-xl !border !border-sky-500/30 !bg-sky-500/15 !px-6 !py-3 !text-sm !font-semibold !text-sky-200 hover:!bg-sky-500/20"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
