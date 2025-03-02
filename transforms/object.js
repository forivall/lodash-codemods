/**
 * @template T
 * @typedef {import('../jscodeshift_loose').ExclusifyProps<T>} ExclusifyProps
 */
/**
 * @template T
 * @typedef {import('../jscodeshift_loose').ExclusifyUnion<T>} ExclusifyUnion
 */

/** @type {unknown[]} */
const methods = /** @type {const} */ ([
    'clone',
    'extend',
    'keys',
    'pairs',
    'values',
]);

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

            switch (
                /** @type {ExclusifyUnion<typeof property>} */ (property).name
            ) {
                case 'clone':
                    return j.objectExpression([j.spreadProperty(args[0])]);
                case 'extend':
                    if (
                        args[0].type === 'ObjectExpression' &&
                        args[0].properties.length === 0
                    ) {
                        const [, ...rest] = args;
                        return j.objectExpression(
                            rest.map(arg => j.spreadProperty(arg))
                        );
                    } else {
                        return j.callExpression(
                            j.memberExpression(
                                j.identifier('Object'),
                                j.identifier('assign')
                            ),
                            args
                        );
                    }
                case 'keys':
                    return j.callExpression(
                        j.memberExpression(
                            j.identifier('Object'),
                            j.identifier('keys')
                        ),
                        args
                    );
                case 'pairs':
                    return j.callExpression(
                        j.memberExpression(
                            j.identifier('Object'),
                            j.identifier('entries')
                        ),
                        args
                    );
                case 'values':
                    return j.callExpression(
                        j.memberExpression(
                            j.identifier('Object'),
                            j.identifier('values')
                        ),
                        args
                    );
            }
        })
        .toSource();
};
