type TextInputProps = {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChangeCallback: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TextInput({
  value,
  placeholder,
  disabled,
  onChangeCallback,
}: TextInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder ?? ""}
      value={value}
      disabled={disabled}
      onChange={onChangeCallback}
      style={{
        fontSize: "1rem",
        opacity: disabled ? 0.5 : 1,
      }}
    />
  );
}
