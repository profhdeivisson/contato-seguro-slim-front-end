import { Tag } from 'antd';

import {
    type Involvement,
    INVOLVEMENT_TYPE_COLORS,
    INVOLVEMENT_TYPE_LABELS,
} from '../involvement.type';

type Props = {
    type: Involvement.Type;
};

export function InvolvementTypeTag({ type }: Props) {
    const label = INVOLVEMENT_TYPE_LABELS[type] ? INVOLVEMENT_TYPE_LABELS[type] : type;
    const color = INVOLVEMENT_TYPE_COLORS[type] ? INVOLVEMENT_TYPE_COLORS[type] : 'default';

    return <Tag color={color}>{label}</Tag>;
}
