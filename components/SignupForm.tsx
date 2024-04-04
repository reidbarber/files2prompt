////////////////
//
// Using Framer?
// See https://www.framer.com/learn/code-components/ for more info
//
////////////////

import { useState } from "react";
import { Button, Input, TextField } from "react-aria-components";

const INIT = "INIT";
const SUBMITTING = "SUBMITTING";
const ERROR = "ERROR";
const SUCCESS = "SUCCESS";
const formStates = [INIT, SUBMITTING, ERROR, SUCCESS] as const;
const formStyles = {
  id: "clukerhmq00kuml89m15tutl4",
  name: "Default",
  formStyle: "inline",
  placeholderText: "you@example.com",
  formFont: "Inter",
  formFontColor: "#000000",
  formFontSizePx: 14,
  buttonText: "Stay Updated",
  buttonFont: "Inter",
  buttonFontColor: "#ffffff",
  buttonColor: "#0D9488",
  buttonFontSizePx: 14,
  successMessage: "Thanks! We'll be in touch!",
  successFont: "Inter",
  successFontColor: "#000000",
  successFontSizePx: 14,
  userGroup: "",
};
const domain = "app.loops.so";

export default function SignUpFormReact() {
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<(typeof formStates)[number]>(INIT);
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setEmail("");
    setFormState(INIT);
    setErrorMessage("");
  };

  /**
   * Rate limit the number of submissions allowed
   * @returns {boolean} true if the form has been successfully submitted in the past minute
   */
  const hasRecentSubmission = () => {
    const time = new Date();
    const timestamp = time.valueOf();
    const previousTimestamp = localStorage.getItem("loops-form-timestamp");

    // Indicate if the last sign up was less than a minute ago
    if (
      previousTimestamp &&
      Number(previousTimestamp) + 60 * 1000 > timestamp
    ) {
      setFormState(ERROR);
      setErrorMessage("Too many signups, please try again in a little while");
      return true;
    }

    localStorage.setItem("loops-form-timestamp", timestamp.toString());
    return false;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission
    event.preventDefault();

    // boundary conditions for submission
    if (formState !== INIT) return;
    if (!isValidEmail(email)) {
      setFormState(ERROR);
      setErrorMessage("Please enter a valid email");
      return;
    }
    if (hasRecentSubmission()) return;
    setFormState(SUBMITTING);

    // build body
    const formBody = `userGroup=${encodeURIComponent(
      formStyles.userGroup
    )}&email=${encodeURIComponent(email)}`;

    // API request to add user to newsletter
    fetch(`https://${domain}/api/newsletter-form/${formStyles.id}`, {
      method: "POST",
      body: formBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((res: any) => [res.ok, res.json(), res])
      .then(([ok, dataPromise, res]) => {
        if (ok) {
          resetForm();
          setFormState(SUCCESS);
        } else {
          dataPromise.then((data: any) => {
            setFormState(ERROR);
            setErrorMessage(data.message || res.statusText);
            localStorage.setItem("loops-form-timestamp", "");
          });
        }
      })
      .catch((error) => {
        setFormState(ERROR);
        // check for cloudflare error
        if (error.message === "Failed to fetch") {
          setErrorMessage(
            "Too many signups, please try again in a little while"
          );
        } else if (error.message) {
          setErrorMessage(error.message);
        }
        localStorage.setItem("loops-form-timestamp", "");
      });
  };

  const isInline = formStyles.formStyle === "inline";

  switch (formState) {
    case SUCCESS:
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <p
            style={{
              fontFamily: `'${formStyles.successFont}', sans-serif`,
              color: formStyles.successFontColor,
              fontSize: `${formStyles.successFontSizePx}px`,
            }}
          >
            {formStyles.successMessage}
          </p>
        </div>
      );
    case ERROR:
      return (
        <>
          <SignUpFormError />
          <BackButton />
        </>
      );
    default:
      return (
        <>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center w-full items gap-2 h-10"
          >
            <TextField value={email} onChange={setEmail}>
              <Input
                type="text"
                name="email"
                placeholder={formStyles.placeholderText}
                className="h-10 rounded-md bg-transparent border border-slate-600 dark:border-slate-100 dark:hover:border-slate-300 px-2 py-1 dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2  ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out"
              />
            </TextField>
            <SignUpFormButton />
          </form>
        </>
      );
  }

  function SignUpFormError() {
    return (
      <div
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            color: "rgb(185, 28, 28)",
            fontSize: "14px",
          }}
        >
          {errorMessage || "Oops! Something went wrong, please try again"}
        </p>
      </div>
    );
  }

  function BackButton() {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        style={{
          color: "#6b7280",
          font: "14px, Inter, sans-serif",
          margin: "10px auto",
          textAlign: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textDecoration: isHovered ? "underline" : "none",
        }}
        onMouseOut={() => setIsHovered(false)}
        onMouseOver={() => setIsHovered(true)}
        onClick={resetForm}
      >
        &larr; Back
      </button>
    );
  }

  function SignUpFormButton({ props }: any) {
    return (
      <Button
        type="submit"
        className="h-10 rounded-md border border-slate-600 dark:border-slate-100 dark:hover:border-slate-300 px-2 py-1 cursor-default dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2  ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out"
      >
        {formState === SUBMITTING ? "Please wait..." : formStyles.buttonText}
      </Button>
    );
  }
}

function isValidEmail(email: any) {
  return /.+@.+/.test(email);
}
