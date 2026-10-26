<?php
defined( 'ABSPATH' ) || exit;

/** A bounded, rectangular table: no JSON or HTML is exposed to the site owner. */
class Omega_Site_Matrix_Field extends acf_field {
    public $show_in_rest = false;

    public function __construct() {
        $this->name = 'omega_matrix';
        $this->label = 'Таблица шага зуба';
        $this->category = 'content';
        $this->defaults = array( 'max_rows' => 25, 'max_columns' => 30, 'max_cells' => 750 );
        parent::__construct();
    }

    public function input_admin_enqueue_scripts() {
        $base = dirname( __DIR__ );
        $url = plugins_url( 'assets/', $base . '/omega-site-settings.php' );
        wp_enqueue_style( 'omega-site-matrix', $url . 'matrix.css', array(), (string) filemtime( $base . '/assets/matrix.css' ) );
        wp_enqueue_script( 'omega-site-matrix', $url . 'matrix.js', array( 'acf-input' ), (string) filemtime( $base . '/assets/matrix.js' ), true );
    }

    /** Return a normalized matrix or an actionable Russian validation message. */
    public static function normalise( $value, array $field = array() ) {
        if ( ! is_array( $value ) || ! isset( $value['diameters'], $value['walls'], $value['cells'] ) || ! is_array( $value['diameters'] ) || ! is_array( $value['walls'] ) || ! is_array( $value['cells'] ) ) {
            return 'Заполните оси и значения таблицы.';
        }
        $columns = count( $value['diameters'] );
        $rows = count( $value['walls'] );
        if ( $columns < 1 || $rows < 1 ) {
            return 'В таблице нужны хотя бы один диаметр и одна толщина стенки.';
        }
        if ( $columns > (int) ( $field['max_columns'] ?? 30 ) || $rows > (int) ( $field['max_rows'] ?? 25 ) || $columns * $rows > (int) ( $field['max_cells'] ?? 750 ) ) {
            return 'Таблица превышает допустимый размер. Сократите число строк или столбцов.';
        }
        $matrix = array();
        foreach ( array( 'diameters' => 'Диаметры', 'walls' => 'Толщины стенки' ) as $axis => $label ) {
            $matrix[ $axis ] = array();
            $previous = 0;
            foreach ( array_values( $value[ $axis ] ) as $index => $number ) {
                $number = is_scalar( $number ) ? str_replace( ',', '.', trim( (string) $number ) ) : '';
                if ( ! preg_match( '~^\d+(?:\.\d+)?$~D', $number ) || ! is_finite( (float) $number ) || (float) $number <= 0 ) {
                    return $label . ': укажите положительное число в позиции ' . ( $index + 1 ) . '.';
                }
                if ( (float) $number <= $previous ) {
                    return $label . ' должны идти по возрастанию, без повторов. Проверьте позицию ' . ( $index + 1 ) . '.';
                }
                $previous = (float) $number;
                $matrix[ $axis ][] = $previous;
            }
        }
        if ( count( $value['cells'] ) !== $rows ) {
            return 'Число строк значений не совпадает с числом толщин стенки. Перезагрузите страницу без сохранения и повторите изменение.';
        }
        $matrix['cells'] = array();
        foreach ( array_values( $value['cells'] ) as $row_index => $row ) {
            if ( ! is_array( $row ) || count( $row ) !== $columns ) {
                return 'В строке ' . ( $row_index + 1 ) . ' число значений не совпадает с числом диаметров.';
            }
            $normal_row = array();
            foreach ( array_values( $row ) as $column_index => $pitch ) {
                if ( null === $pitch || ( is_scalar( $pitch ) && '' === trim( (string) $pitch ) ) ) {
                    $normal_row[] = null;
                    continue;
                }
                $pitch = is_scalar( $pitch ) ? trim( (string) $pitch ) : '';
                if ( ! preg_match( '~^\d+(?:[.,]\d+)?(?:/\d+(?:[.,]\d+)?)?$~D', $pitch ) ) {
                    return 'Шаг зуба: строка ' . ( $row_index + 1 ) . ', столбец ' . ( $column_index + 1 ) . '. Пример: 14, 4/6 или 1,4/2. Нет данных — оставьте ячейку пустой.';
                }
                foreach ( explode( '/', str_replace( ',', '.', $pitch ) ) as $part ) {
                    if ( (float) $part <= 0 ) {
                        return 'Шаг зуба должен быть больше нуля: строка ' . ( $row_index + 1 ) . ', столбец ' . ( $column_index + 1 ) . '.';
                    }
                }
                $normal_row[] = $pitch;
            }
            $matrix['cells'][] = $normal_row;
        }
        return $matrix;
    }

    public function validate_value( $valid, $value, $field, $input ) {
        if ( true !== $valid ) {
            return $valid;
        }
        $normalised = self::normalise( $value, $field );
        return is_array( $normalised ) ? true : $normalised;
    }

    public function update_value( $value, $post_id, $field ) {
        $normalised = self::normalise( $value, $field );
        if ( is_array( $normalised ) ) {
            return $normalised;
        }
        // Validation normally stops a malformed submission. Programmatic writes keep the old table.
        $previous = function_exists( 'acf_get_metadata' ) ? acf_get_metadata( $post_id, $field['name'] ?? '' ) : null;
        return is_array( $previous ) ? $previous : ( $field['default_value'] ?? $field['default'] ?? null );
    }

    public function render_field( $field ) {
        $value = $field['value'] ?? $field['default_value'] ?? $field['default'] ?? array();
        $matrix = self::normalise( $value, $field );
        if ( ! is_array( $matrix ) ) {
            $matrix = self::normalise( $field['default_value'] ?? $field['default'] ?? array(), $field );
        }
        if ( ! is_array( $matrix ) ) {
            $matrix = array( 'diameters' => array( 20 ), 'walls' => array( 2 ), 'cells' => array( array( null ) ) );
        }
        $name = $field['name'];
        $row_label = $field['row_label'] ?? 'Толщина стенки, мм';
        $column_label = $field['column_label'] ?? 'Наружный диаметр, мм';
        ?>
        <div class="omega-matrix" data-name="<?php echo esc_attr( $name ); ?>" data-max-rows="<?php echo esc_attr( $field['max_rows'] ?? 25 ); ?>" data-max-columns="<?php echo esc_attr( $field['max_columns'] ?? 30 ); ?>" data-max-cells="<?php echo esc_attr( $field['max_cells'] ?? 750 ); ?>">
            <p class="description">Сверху — <?php echo esc_html( $column_label ); ?>; слева — <?php echo esc_html( $row_label ); ?>. Значения по возрастанию. В ячейках укажите шаг TPI, например 4/6. Пустая ячейка означает «нет данных».</p>
            <div class="omega-matrix-scroll" tabindex="0" role="region" aria-label="Редактирование таблицы шага зуба">
            <table class="omega-matrix-table"><caption class="screen-reader-text">Таблица шага зуба: диаметры, толщины стенки и TPI</caption><thead><tr><th scope="col"><?php echo esc_html( $row_label ); ?></th>
                <?php foreach ( $matrix['diameters'] as $column => $diameter ) : ?>
                    <th scope="col"><input class="omega-axis" type="text" inputmode="decimal" name="<?php echo esc_attr( $name . '[diameters][' . $column . ']' ); ?>" value="<?php echo esc_attr( $diameter ); ?>" aria-label="<?php echo esc_attr( $column_label . ', столбец ' . ( $column + 1 ) ); ?>"><button type="button" class="omega-matrix-remove" data-remove-column="<?php echo esc_attr( $column ); ?>" aria-label="<?php echo esc_attr( 'Удалить столбец ' . ( $column + 1 ) ); ?>">×</button></th>
                <?php endforeach; ?>
            </tr></thead><tbody>
                <?php foreach ( $matrix['walls'] as $row => $wall ) : ?>
                    <tr><th scope="row"><input class="omega-axis" type="text" inputmode="decimal" name="<?php echo esc_attr( $name . '[walls][' . $row . ']' ); ?>" value="<?php echo esc_attr( $wall ); ?>" aria-label="<?php echo esc_attr( $row_label . ', строка ' . ( $row + 1 ) ); ?>"><button type="button" class="omega-matrix-remove" data-remove-row="<?php echo esc_attr( $row ); ?>" aria-label="<?php echo esc_attr( 'Удалить строку ' . ( $row + 1 ) ); ?>">×</button></th>
                        <?php foreach ( $matrix['diameters'] as $column => $diameter ) : ?>
                            <td><input class="omega-pitch" type="text" maxlength="24" name="<?php echo esc_attr( $name . '[cells][' . $row . '][' . $column . ']' ); ?>" value="<?php echo esc_attr( $matrix['cells'][ $row ][ $column ] ?? '' ); ?>" aria-label="<?php echo esc_attr( 'TPI: стенка ' . $wall . ' мм, диаметр ' . $diameter . ' мм' ); ?>"></td>
                        <?php endforeach; ?>
                    </tr>
                <?php endforeach; ?>
            </tbody></table></div>
            <div class="omega-matrix-actions"><button type="button" class="button" data-add-column>Добавить диаметр</button><button type="button" class="button" data-add-row>Добавить толщину стенки</button><span class="omega-matrix-count"><?php echo esc_html( count( $matrix['walls'] ) . ' строк × ' . count( $matrix['diameters'] ) . ' столбцов' ); ?></span></div>
            <p class="omega-matrix-status" role="status" aria-live="polite"></p>
        </div>
        <?php
    }
}
