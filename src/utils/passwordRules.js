// The password rule for signup and change password, so both pages check the same thing.
// The pattern means: at least one number (\d), at least one symbol (not a letter or number),
// and at least 8 characters in total
export const PASSWORD_PATTERN = "(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}";

export const PASSWORD_HINT = "Use at least 8 characters, including a number and a symbol.";
