/**
 * @template T
 * @typedef {import('../jscodeshift_loose').ExclusifyProps<T>} ExclusifyProps
 */
/**
 * @template T
 * @typedef {import('../jscodeshift_loose').ExclusifyUnion<T>} ExclusifyUnion
 */

/** @type {unknown[]} */
const methods = /** @type {const} */ (['bind', 'partial']);

/** @type {import('jscodeshift').Transform} */
module.exports = (file, api) => {
    const j = api.jscodeshift;

    const root = j(file.source);

    return root
        .find(j.CallExpression)
        .filter(p => {
            const callee = p.value.callee;
            if (callee.type === 'MemberExpression') {
                const {object, property} =
                    /** @type {ExclusifyProps<typeof callee>} */ (callee);
                if (
                    object.name === '_' &&
                    methods.indexOf(property.name) !== -1
                ) {
                    return true;
                }
            }
            return false;
        })
        .replaceWith(p => {
            const {property} =
                /** @type {ExclusifyUnion<typeof p.value.callee>} */ (
                    p.value.callee
                );
            const {arguments: args} = p.value;
            const [fn, ...rest] = args;

            switch (
                /** @type {ExclusifyUnion<typeof property>} */ (property).name
            ) {
                case 'bind':
                    return j.callExpression(
                        j.memberExpression(fn, j.identifier('bind')),
                        rest
                    );
                case 'partial':
                    // TODO: handle _.partial(fn, a, _, c)
                    return j.arrowFunctionExpression(
                        [j.restElement(j.identifier('args'))],
                        j.callExpression(fn, [
                            ...rest,
                            j.spreadElement(j.identifier('args')),
                        ])
                    );
            }
        })
        .toSource();
};
