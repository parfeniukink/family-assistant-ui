type TextInputProps = {
  value: string;
  placeholder?: string;
  onChangeCallback: (e: any) => void;
};

export function TextInput({
  value,
  placeholder,
  onChangeCallback,
}: TextInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder ?? ""}
      value={value}
      onChange={onChangeCallback}
      style={{
        fontSize: "16px",
      }}
    />
  );
}
