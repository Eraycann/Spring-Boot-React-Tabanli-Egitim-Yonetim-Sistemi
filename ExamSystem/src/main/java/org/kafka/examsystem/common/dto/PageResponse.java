package org.kafka.examsystem.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Sayfalı yanıtlar için genel DTO sınıfı.
 * İçerik listesi ve sayfalama meta verilerini (toplam sayfa, toplam eleman vb.) içerir.
 *
 * @param <T> Sayfanın içerdiği elemanların tipi.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content; // Sayfanın içeriği (DTO listesi)
    private int pageNumber; // Mevcut sayfa numarası (0'dan başlar)
    private int pageSize; // Sayfa başına eleman sayısı
    private long totalElements; // Toplam eleman sayısı
    private int totalPages; // Toplam sayfa sayısı
    private boolean isLast; // Son sayfa mı?
    private boolean isFirst; // İlk sayfa mı?

    /**
     * Spring Data Page nesnesinden PageResponse oluşturur.
     *
     * @param page Spring Data Page nesnesi.
     * @param content Sayfanın dönüştürülmüş içeriği (DTO listesi).
     * @param <T> İçerik listesinin tipi.
     * @param <U> Orijinal Page nesnesinin tipi.
     * @return PageResponse nesnesi.
     */
    public static <T, U> PageResponse<T> fromPage(Page<U> page, List<T> content) {
        PageResponse<T> response = new PageResponse<>();
        response.setContent(content);
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        response.setFirst(page.isFirst());
        return response;
    }
}
