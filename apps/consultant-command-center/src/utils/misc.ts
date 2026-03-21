export const buildClassName = (
	classNames: string[],
	styles: Record<string, string>,
): string => {
	return classNames
		.map((className) => styles[className])
		.filter(Boolean)
		.join(" ");
};
