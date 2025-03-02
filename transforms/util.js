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
    'isArray',
    'isBoolean',
    'isFinite',
    'isFunction',
    'isNull',
    'isString',
    'isUndefined',
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
                case 'isArray':
                    return j.callExpression(
                        j.memberExpression(
                            j.identifier('Array'),
                            j.identifier('isArray')
                        ),
                        args
                    );
                case 'isBoolean':
                    return j.binaryExpression(
                        '===',
                        j.unaryExpression('typeof', args[0]),
                        j.literal('boolean')
                    );
                case 'isFinite':
                    return j.callExpression(
                        j.memberExpression(
                            j.identifier('Number'),
                            j.identifier('isFinite')
                        ),
                        args
                    );
                case 'isFunction':
                    return j.binaryExpression(
                        '===',
                        j.unaryExpression('typeof', args[0]),
                        j.literal('function')
                    );
                case 'isNull':
                    return j.binaryExpression('===', args[0], j.literal(null));
                case 'isString':
                    return j.binaryExpression(
                        '===',
                        j.unaryExpression('typeof', args[0]),
                        j.literal('string')
                    );
                case 'isUndefined':
                    return j.binaryExpression(
                        '===',
                        j.unaryExpression('typeof', args[0]),
                        j.literal('undefined')
                    );
                default:
                    break;
            }
        })
        .toSource();
};
